from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session


from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.post import Post
from app.models.user import User
from app.schemas.post import PaginatedPostResponse, PostResponse, PostUpdate
from app.services.file_upload import save_post_image
from app.services.plan_limits import check_post_limit, check_image_limit


router = APIRouter(prefix="/posts", tags=["Posts"])


@router.post(
    "",
    response_model=PostResponse,
    status_code=status.HTTP_201_CREATED
)
async def create_post(
    title: str = Form(..., min_length=3, max_length=200),
    content: str = Form(..., min_length=1),
    image: UploadFile | None = File(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    check_post_limit(db, current_user)

    image_url = None

    if image:
        check_image_limit(db, current_user)
        image_url = await save_post_image(image)

    post = Post(
        title=title,
        content=content,
        image=image_url,
        author_id=current_user.id
    )

    db.add(post)
    db.commit()
    db.refresh(post)

    return post


@router.get("", response_model=PaginatedPostResponse)
def get_posts(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    search: str | None = Query(default=None),
    db: Session = Depends(get_db)
):
    query = db.query(Post)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            Post.title.ilike(search_term) |
            Post.content.ilike(search_term)
        )

    total = query.count()

    total_pages = (total + limit - 1) // limit

    offset = (page - 1) * limit

    posts = query.order_by(
        Post.created_at.desc()
    ).offset(offset).limit(limit).all()

    return {
        "items": posts,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages
    }


@router.get("/mine", response_model=list[PostResponse])
def get_my_posts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Post).filter(
        Post.author_id == current_user.id
    ).order_by(Post.created_at.desc()).all()


@router.get("/{post_id}", response_model=PostResponse)
def get_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()

    if not post:
        raise HTTPException(
            status_code=404,
            detail="Post not found"
        )

    return post


@router.put("/{post_id}", response_model=PostResponse)
async def update_post(
    post_id: int,
    title: str | None = Form(default=None, min_length=3, max_length=200),
    content: str | None = Form(default=None, min_length=1),
    image: UploadFile | None = File(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    post = db.query(Post).filter(Post.id == post_id).first()

    if not post:
        raise HTTPException(
            status_code=404,
            detail="Post not found"
        )

    if post.author_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You can only update your own posts"
        )

    if title is not None:
        post.title = title

    if content is not None:
        post.content = content

    if image:
        post.image = await save_post_image(image)

    db.commit()
    db.refresh(post)

    return post


@router.delete(
    "/{post_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    post = db.query(Post).filter(Post.id == post_id).first()

    if not post:
        raise HTTPException(
            status_code=404,
            detail="Post not found"
        )

    if post.author_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You can only delete your own posts"
        )

    db.delete(post)
    db.commit()

    return None