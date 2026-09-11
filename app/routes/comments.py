from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.comment import Comment
from app.models.post import Post
from app.models.user import User
from app.schemas.comment import CommentCreate, CommentResponse
from app.services.email import send_email


router = APIRouter(
    prefix="/posts/{post_id}/comments",
    tags=["Comments"]
)


@router.post(
    "",
    response_model=CommentResponse,
    status_code=status.HTTP_201_CREATED
)
def create_comment(
    post_id: int,
    comment_data: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    post = db.query(Post).filter(Post.id == post_id).first()

    if not post:
        raise HTTPException(
            status_code=404,
            detail="Post not found"
        )

    comment = Comment(
        post_id=post_id,
        user_id=current_user.id,
        text=comment_data.text
    )

    db.add(comment)
    db.commit()
    db.refresh(comment)

    # Send notification to the post owner
    if post.author_id != current_user.id:
        send_email(
            to_email=post.author.email,
            subject="New Comment on Your Post",
            body=(
                f"Hello {post.author.username},\n\n"
                f"{current_user.username} commented on your post "
                f"'{post.title}'.\n\n"
                f"Comment:\n{comment.text}\n\n"
                f"Thank you,\nBlog Management API"
            )
        )

    return comment

@router.get(
    "",
    response_model=list[CommentResponse]
)
def get_comments(
    post_id: int,
    db: Session = Depends(get_db)
):
    post = db.query(Post).filter(
        Post.id == post_id
    ).first()

    if not post:
        raise HTTPException(
            status_code=404,
            detail="Post not found"
        )

    return db.query(Comment).filter(
        Comment.post_id == post_id
    ).order_by(
        Comment.created_at.asc()
    ).all()