from fastapi import APIRouter
from app.schemas.ai_chat import AIChatRequest, AIChatResponse


router = APIRouter(
    prefix="/ai",
    tags=["AI Chat"]
)


@router.post("/chat", response_model=AIChatResponse)
def ai_chat(request: AIChatRequest):

    message = request.message.lower().strip()

    if "notification" in message:
        reply = (
            "Notifications keep you updated about activity on your account. "
            "You can receive alerts when someone likes or comments on your posts, "
            "or when your subscription is activated. You can view your notifications "
            "using the bell icon on your dashboard and mark them as read or unread."
        )

    elif "create post" in message or "create a post" in message:
        reply = (
            "To create a post, provide a title and some content. "
            "You can also add an image to your post if you want."
        )

    elif "like" in message:
        reply = (
            "You can like a post by selecting the Like option on the post. "
            "A notification is sent to the post owner when their post is liked."
        )

    elif "comment" in message:
        reply = (
            "You can add a comment by opening a post and submitting your message "
            "in the comment section. The post owner will receive a notification."
        )

    elif "dashboard" in message:
        reply = (
            "Your dashboard gives you an overview of your activity, including "
            "your total posts, comments made, likes received, post views, "
            "and activity charts."
        )

    elif "subscription" in message or "premium" in message or "pro" in message:
        reply = (
            "Subscriptions provide different levels of access to the platform. "
            "You can choose between Basic, Premium, and Pro plans, each with "
            "different usage limits and features."
        )

    elif "hello" in message or "hi" in message:
        reply = (
            "Hello! 👋 I'm your AI support assistant. "
            "How can I help you with the blog platform?"
        )

    elif "help" in message or "what can you do" in message:
        reply = (
            "I can help you understand how posts, comments, likes, "
            "notifications, subscriptions, and the dashboard work."
        )

    else:
        reply = (
            "I'm your AI support assistant. "
            "I can help you with posts, comments, likes, notifications, "
            "subscriptions, and your dashboard. "
            "Please tell me what you'd like to know."
        )

    return {
        "reply": reply
    }