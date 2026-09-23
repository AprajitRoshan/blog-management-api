from pydantic import BaseModel


class PostAnalytics(BaseModel):
    post_id: int
    title: str
    likes: int
    comments: int


class ActivityAnalytics(BaseModel):
    date: str
    posts: int


class DashboardResponse(BaseModel):
    total_posts: int
    total_comments: int
    total_likes_received: int
    total_post_views: int
    posts: list[PostAnalytics]
    activity: list[ActivityAnalytics]