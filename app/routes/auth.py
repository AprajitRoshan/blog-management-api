from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from authlib.integrations.starlette_client import OAuth

from app.core.database import get_db
from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.core.config import settings
from app.models.user import User
from app.schemas.auth import TokenResponse
from app.schemas.user import UserCreate, UserResponse
from fastapi.security import OAuth2PasswordRequestForm


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# Auth0 OAuth client
oauth = OAuth()

oauth.register(
    name="auth0",
    client_id=settings.AUTH0_CLIENT_ID,
    client_secret=settings.AUTH0_CLIENT_SECRET,
    server_metadata_url=(
        f"https://{settings.AUTH0_DOMAIN}/"
        ".well-known/openid-configuration"
    ),
    client_kwargs={
        "scope": "openid profile email"
    }
)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED
)
def register(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    existing_username = db.query(User).filter(
        User.username == user_data.username
    ).first()

    if existing_username:
        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )

    existing_email = db.query(User).filter(
        User.email == user_data.email
    ).first()

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    user = User(
        username=user_data.username,
        email=user_data.email,
        password=hash_password(user_data.password),
        auth_provider="local"
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


@router.post(
    "/login",
    response_model=TokenResponse
)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.email == form_data.username
    ).first()

    if (
        not user
        or not user.password
        or not verify_password(
            form_data.password,
            user.password
        )
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        {"sub": str(user.id)}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.get("/google")
async def google_login(request: Request):
    redirect_uri = settings.AUTH0_CALLBACK_URL

    return await oauth.auth0.authorize_redirect(
        request,
        redirect_uri,
        connection="google-oauth2"
    )


@router.get("/facebook")
async def facebook_login(request: Request):
    redirect_uri = settings.AUTH0_CALLBACK_URL

    return await oauth.auth0.authorize_redirect(
        request,
        redirect_uri,
        connection="facebook"
    )


@router.get("/callback")
async def auth0_callback(
    request: Request,
    db: Session = Depends(get_db)
):
    token = await oauth.auth0.authorize_access_token(request)

    userinfo = token.get("userinfo")

    if not userinfo:
        userinfo = await oauth.auth0.userinfo(token=token)

    auth0_sub = userinfo.get("sub")
    email = userinfo.get("email")
    email_verified = userinfo.get("email_verified", False)

    if not auth0_sub:
        raise HTTPException(
            status_code=400,
            detail="Auth0 account did not provide a user identifier"
        )

    provider = auth0_sub.split("|")[0]

    # Check whether this social account already exists
    user = db.query(User).filter(
        User.auth0_sub == auth0_sub
    ).first()

    if not user:

        # Only try email-based account linking when an email exists
        if email:
            user = db.query(User).filter(
                User.email == email
            ).first()

            if user:

                if not email_verified:
                    raise HTTPException(
                        status_code=400,
                        detail="Email must be verified before linking the social account"
                    )

                user.auth0_sub = auth0_sub
                user.auth_provider = provider

        # Create a new social user
        if not user:
            base_username = (
                userinfo.get("nickname")
                or userinfo.get("name")
                or f"{provider}_user"
            )

            base_username = (
                base_username
                .replace(" ", "_")
                .lower()
            )

            username = base_username
            counter = 1

            while db.query(User).filter(
                User.username == username
            ).first():
                username = f"{base_username}_{counter}"
                counter += 1

            user = User(
                username=username,
                email=email,
                password="",
                auth_provider=provider,
                auth0_sub=auth0_sub
            )

            db.add(user)

    db.commit()
    db.refresh(user)

    access_token = create_access_token(
        {"sub": str(user.id)}
    )

    return RedirectResponse(
    url=f"/dashboard?token={access_token}"
)