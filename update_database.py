from sqlalchemy import text

from app.core.database import Base, engine
from app.models import (
    User,
    Post,
    Comment,
    Like,
    SubscriptionPlan,
    BillingHistory,
)


def update_database():
    # Create new tables
    Base.metadata.create_all(bind=engine)

    # Add subscription_plan_id to existing users table
    with engine.begin() as connection:
        columns = connection.execute(
            text("PRAGMA table_info(users)")
        ).fetchall()

        column_names = [column[1] for column in columns]

        if "subscription_plan_id" not in column_names:
            connection.execute(
                text(
                    "ALTER TABLE users "
                    "ADD COLUMN subscription_plan_id INTEGER"
                )
            )
            print("Added subscription_plan_id to users table.")
        else:
            print("subscription_plan_id already exists.")

    print("Database updated successfully.")


if __name__ == "__main__":
    update_database()