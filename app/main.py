from fastapi import FastAPI
from starlette.middleware.sessions import SessionMiddleware

from app.core.database import Base, engine
from app.models import User, Post, Comment, Like

from app.routes.auth import router as auth_router
from app.routes.posts import router as posts_router
from app.routes.comments import router as comments_router
from app.routes.likes import router as likes_router
from app.routes.subscriptions import router as subscriptions_router
from app.routes.dashboard import router as dashboard_router
from app.routes.notifications import router as notification_router
from app.routes.ai_chat import router as ai_chat_router

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path

from app.core.config import settings


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Blog Management API",
    version="1.0.0",
    description="Mini blogging system built with FastAPI"
)

# Session middleware required for Auth0 OAuth state
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.AUTH0_CLIENT_SECRET
)

app.mount(
    "/media",
    StaticFiles(directory="media"),
    name="media"
)

app.mount(
    "/static",
    StaticFiles(directory="app/static"),
    name="static"
)

app.include_router(auth_router)
app.include_router(posts_router)
app.include_router(comments_router)
app.include_router(likes_router)
app.include_router(subscriptions_router)
app.include_router(dashboard_router)
app.include_router(notification_router)
app.include_router(ai_chat_router)


@app.get("/")
def root():
    return {
        "message": "Blog Management API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.get("/dashboard")
def dashboard():
    return FileResponse(
        Path("app/static/dashboard.html")
    )