from datetime import datetime

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.billing_history import BillingHistory
from app.models.user import User
from app.models.post import Post
from app.models.comment import Comment
from app.models.like import Like
from app.models.subscription_plan import SubscriptionPlan


PLAN_LIMIT_MESSAGE = (
    "You’ve reached your plan limit. Kindly upgrade your plan to continue."
)


def get_active_plan(db: Session, user: User):
    billing = (
        db.query(BillingHistory)
        .filter(
            BillingHistory.user_id == user.id,
            BillingHistory.start_date <= datetime.utcnow(),
            BillingHistory.end_date >= datetime.utcnow(),
        )
        .order_by(BillingHistory.end_date.desc())
        .first()
    )

    if not billing:
        raise HTTPException(
            status_code=403,
            detail="You do not have an active subscription."
        )

    plan = db.query(SubscriptionPlan).filter(
        SubscriptionPlan.id == billing.subscription_plan_id
    ).first()

    if not plan:
        raise HTTPException(
            status_code=403,
            detail="You do not have an active subscription."
        )

    return plan


def check_post_limit(db: Session, user: User):
    plan = get_active_plan(db, user)

    if plan.max_posts is None:
        return

    post_count = db.query(Post).filter(
        Post.author_id == user.id
    ).count()

    if post_count >= plan.max_posts:
        raise HTTPException(
            status_code=403,
            detail=PLAN_LIMIT_MESSAGE
        )


def check_comment_limit(db: Session, user: User):
    plan = get_active_plan(db, user)

    if plan.max_comments is None:
        return

    comment_count = db.query(Comment).filter(
        Comment.user_id == user.id
    ).count()

    if comment_count >= plan.max_comments:
        raise HTTPException(
            status_code=403,
            detail=PLAN_LIMIT_MESSAGE
        )


def check_like_limit(db: Session, user: User):
    plan = get_active_plan(db, user)

    if plan.max_likes is None:
        return

    like_count = db.query(Like).filter(
        Like.user_id == user.id
    ).count()

    if like_count >= plan.max_likes:
        raise HTTPException(
            status_code=403,
            detail=PLAN_LIMIT_MESSAGE
        )

def check_image_limit(db: Session, user: User):
    plan = get_active_plan(db, user)

    if plan.max_images_per_post is None:
        return

    if plan.max_images_per_post <= 1:
        return