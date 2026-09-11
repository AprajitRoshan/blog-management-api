from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.like import Like
from app.models.post import Post
from app.models.user import User
from app.services.email import send_email


router = APIRouter(
    prefix="/posts/{post_id}/likes",
    tags=["Likes"]
)


@router.post("")
def like_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check whether the post exists
    post = db.query(Post).filter(
        Post.id == post_id
    ).first()

    if not post:
        raise HTTPException(
            status_code=404,
            detail="Post not found"
        )

    # Check whether the user already liked the post
    existing_like = db.query(Like).filter(
        Like.post_id == post_id,
        Like.user_id == current_user.id
    ).first()

    if existing_like:
        raise HTTPException(
            status_code=400,
            detail="You already liked this post"
        )

    # Create the like
    like = Like(
        post_id=post_id,
        user_id=current_user.id
    )

    db.add(like)

    try:
        db.commit()
        db.refresh(like)

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=400,
            detail="You already liked this post"
        )

    # Send email notification to the post owner
    if post.author_id != current_user.id:
        send_email(
            to_email=post.author.email,
            subject="New Like on Your Post",
            body=(
                f"Hello {post.author.username},\n\n"
                f"{current_user.username} liked your post "
                f"'{post.title}'.\n\n"
                f"Thank you,\n"
                f"Blog Management API"
            )
        )

    return {
        "message": "Post liked successfully"
    }


@router.delete("")
def unlike_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Find the user's like
    like = db.query(Like).filter(
        Like.post_id == post_id,
        Like.user_id == current_user.id
    ).first()

    if not like:
        raise HTTPException(
            status_code=404,
            detail="Like not found"
        )

    # Delete the like
    db.delete(like)
    db.commit()

    return {
        "message": "Post unliked successfully"
    }