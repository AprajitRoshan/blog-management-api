from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    username = Column(
        String(50),
        unique=True,
        nullable=False,
        index=True
    )

    email = Column(
        String(100),
        unique=True,
        nullable=True,
        index=True
    )

    # Normal users have a password.
    # Social users can have this as NULL.
    password = Column(
        String(255),
        nullable=True
    )

    # Authentication provider:
    # "local", "google", or "facebook"
    auth_provider = Column(
        String(50),
        nullable=False,
        default="local"
    )

    # Auth0 user identifier
    auth0_sub = Column(
        String(255),
        unique=True,
        nullable=True,
        index=True
    )

    subscription_plan_id = Column(
        Integer,
        ForeignKey("subscription_plans.id"),
        nullable=True
    )

    subscription_plan = relationship(
        "SubscriptionPlan",
        back_populates="subscriptions"
    )

    posts = relationship(
        "Post",
        back_populates="author",
        cascade="all, delete-orphan"
    )

    comments = relationship(
        "Comment",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    likes = relationship(
        "Like",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    notifications = relationship(
        "Notification",
        back_populates="user",
        cascade="all, delete-orphan"
    )