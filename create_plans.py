from app.core.database import SessionLocal
from app.models.subscription_plan import SubscriptionPlan


def create_plans():
    db = SessionLocal()

    plans = [
        SubscriptionPlan(
            name="Basic",
            price=0.0,
            max_posts=1,
            max_images_per_post=1,
            max_likes=8,
            max_comments=8
        ),
        SubscriptionPlan(
            name="Premium",
            price=499.0,
            max_posts=2,
            max_images_per_post=2,
            max_likes=15,
            max_comments=15
        ),
        SubscriptionPlan(
            name="Pro",
            price=999.0,
            max_posts=None,
            max_images_per_post=None,
            max_likes=None,
            max_comments=None
        )
    ]

    for plan in plans:
        existing_plan = db.query(SubscriptionPlan).filter(
            SubscriptionPlan.name == plan.name
        ).first()

        if not existing_plan:
            db.add(plan)

    db.commit()
    db.close()

    print("Subscription plans created successfully.")


if __name__ == "__main__":
    create_plans()