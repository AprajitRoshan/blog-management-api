from fastapi import FastAPI

from app.core.database import Base, engine
from app.models import User, Post, Comment, Like
from app.routes.auth import router as auth_router
from app.routes.posts import router as posts_router
from app.routes.comments import router as comments_router
from app.routes.likes import router as likes_router


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Blog Management API",
    version="1.0.0",
    description="Mini blogging system built with FastAPI"
)


app.include_router(auth_router)
app.include_router(posts_router)
app.include_router(comments_router)
app.include_router(likes_router)


@app.get("/")
def root():
    return {
        "message": "Blog Management API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }