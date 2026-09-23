from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.like import Like
from app.models.notification import Notification
from app.models.post import Post
from app.models.user import User
from app.services.email import send_email
from app.services.plan_limits import check_like_limit


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
    check_like_limit(db, current_user)

    # Check whether the post exists
    post = (
        db.query(Post)
        .filter(Post.id == post_id)
        .first()
    )

    if not post:
        raise HTTPException(
            status_code=404,
            detail="Post not found"
        )

    # Check whether the user already liked the post
    existing_like = (
        db.query(Like)
        .filter(
            Like.post_id == post_id,
            Like.user_id == current_user.id
        )
        .first()
    )

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

    # Create in-app notification for the post owner
    if post.author_id != current_user.id:
        notification = Notification(
            user_id=post.author_id,
            message=(
                f'{current_user.username} liked your post "{post.title}"'
            ),
            notification_type="like",
            is_read=False
        )

        db.add(notification)
        db.commit()

    # Send email notification to the post owner
    if post.author_id != current_user.id:
        send_email(
            to_email=post.author.email,
            subject="New Like on Your Post",
            body=(
                f'Post: "{post.title}"\n'
                f"User: {current_user.username}\n"
                f"Activity: Liked your post\n"
                f"Time: {datetime.now().strftime('%Y-%m-%d %I:%M %p')}\n"
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
    like = (
        db.query(Like)
        .filter(
            Like.post_id == post_id,
            Like.user_id == current_user.id
        )
        .first()
    )

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