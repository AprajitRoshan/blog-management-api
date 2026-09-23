from collections import Counter

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.comment import Comment
from app.models.like import Like
from app.models.post import Post
from app.models.user import User
from app.schemas.dashboard import DashboardResponse


router = APIRouter(prefix="/user", tags=["Dashboard"])


@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    posts = (
        db.query(Post)
        .filter(Post.author_id == current_user.id)
        .order_by(Post.created_at.asc())
        .all()
    )

    # Total posts
    total_posts = len(posts)

    # Total comments made by current user
    total_comments = (
        db.query(func.count(Comment.id))
        .filter(Comment.user_id == current_user.id)
        .scalar()
    )

    # Total likes received on user's posts
    total_likes_received = (
        db.query(func.count(Like.id))
        .join(Post, Like.post_id == Post.id)
        .filter(Post.author_id == current_user.id)
        .scalar()
    )

    # Total views on user's posts
    total_post_views = (
        db.query(func.coalesce(func.sum(Post.views), 0))
        .filter(Post.author_id == current_user.id)
        .scalar()
    )

    # Likes/comments per post
    post_analytics = []

    for post in posts:
        likes = (
            db.query(func.count(Like.id))
            .filter(Like.post_id == post.id)
            .scalar()
        )

        comments = (
            db.query(func.count(Comment.id))
            .filter(Comment.post_id == post.id)
            .scalar()
        )

        post_analytics.append({
            "post_id": post.id,
            "title": post.title,
            "likes": likes,
            "comments": comments
        })

    # Post activity over time
    activity_counter = Counter(
        post.created_at.strftime("%Y-%m-%d")
        for post in posts
    )

    activity = [
        {
            "date": date,
            "posts": count
        }
        for date, count in sorted(activity_counter.items())
    ]

    return {
        "total_posts": total_posts,
        "total_comments": total_comments,
        "total_likes_received": total_likes_received,
        "total_post_views": total_post_views,
        "posts": post_analytics,
        "activity": activity
    }