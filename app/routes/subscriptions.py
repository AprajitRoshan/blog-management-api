from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.billing_history import BillingHistory
from app.models.notification import Notification
from app.models.subscription_plan import SubscriptionPlan
from app.models.user import User
from app.schemas.subscription import (
    BillingHistoryResponse,
    SubscriptionRequest,
    SubscriptionResponse,
)
from app.services.subscription import subscribe_user


router = APIRouter(
    prefix="/subscriptions",
    tags=["Subscriptions"]
)


@router.post(
    "",
    response_model=SubscriptionResponse
)
def subscribe(
    subscription_data: SubscriptionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plan = db.query(SubscriptionPlan).filter(
        SubscriptionPlan.name.ilike(subscription_data.plan_name)
    ).first()

    if not plan:
        raise HTTPException(
            status_code=404,
            detail="Subscription plan not found"
        )

    billing = subscribe_user(
        db=db,
        user=current_user,
        plan=plan
    )

    # Create in-app subscription notification
    notification = Notification(
        user_id=current_user.id,
        message=f"Your {billing.plan_name} subscription has been activated successfully.",
        notification_type="subscription",
        is_read=False
    )

    db.add(notification)
    db.commit()

    return {
        "message": "Subscription activated successfully",
        "plan_name": billing.plan_name,
        "price": billing.price,
        "start_date": billing.start_date,
        "end_date": billing.end_date,
        "transaction_id": billing.transaction_id,
        "invoice_path": billing.invoice_path
    }


@router.get("/plans")
def get_plans(
    db: Session = Depends(get_db)
):
    return db.query(SubscriptionPlan).all()


@router.get(
    "/billing-history",
    response_model=list[BillingHistoryResponse]
)
def get_billing_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(BillingHistory).filter(
        BillingHistory.user_id == current_user.id
    ).order_by(
        BillingHistory.created_at.desc()
    ).all()