from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.orm import relationship

from app.core.database import Base


class SubscriptionPlan(Base):
    __tablename__ = "subscription_plans"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    price = Column(Float, nullable=False)

    max_posts = Column(Integer, nullable=True)
    max_images_per_post = Column(Integer, nullable=True)
    max_likes = Column(Integer, nullable=True)
    max_comments = Column(Integer, nullable=True)

    subscriptions = relationship(
        "User",
        back_populates="subscription_plan"
    )