from datetime import datetime

from pydantic import BaseModel, Field


class PostCreate(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    content: str = Field(min_length=1)


class PostUpdate(BaseModel):
    title: str | None = Field(
        default=None,
        min_length=3,
        max_length=200
    )
    content: str | None = Field(
        default=None,
        min_length=1
    )


class PostResponse(BaseModel):
    id: int
    title: str
    content: str
    image: str | None = None
    author_id: int
    created_at: datetime
    views: int

    class Config:
        from_attributes = True

class PaginatedPostResponse(BaseModel):
    items: list[PostResponse]
    total: int
    page: int
    limit: int
    total_pages: int