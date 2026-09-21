from django.contrib import admin

from .models import BillingHistory, SubscriptionPlan


@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "price",
        "max_posts",
        "max_images_per_post",
        "max_likes",
        "max_comments",
    )
    search_fields = ("name",)


@admin.register(BillingHistory)
class BillingHistoryAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user_id",
        "plan_name",
        "price",
        "start_date",
        "end_date",
        "transaction_id",
        "invoice_path",
    )
    search_fields = (
        "transaction_id",
        "plan_name",
    )
    list_filter = ("plan_name",)