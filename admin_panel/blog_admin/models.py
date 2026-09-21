from django.db import models


class SubscriptionPlan(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=50)
    price = models.FloatField()
    max_posts = models.IntegerField(null=True)
    max_images_per_post = models.IntegerField(null=True)
    max_likes = models.IntegerField(null=True)
    max_comments = models.IntegerField(null=True)

    class Meta:
        managed = False
        db_table = "subscription_plans"

    def __str__(self):
        return self.name


class BillingHistory(models.Model):
    id = models.IntegerField(primary_key=True)
    user_id = models.IntegerField()
    subscription_plan_id = models.IntegerField()
    plan_name = models.CharField(max_length=50)
    price = models.FloatField()
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    transaction_id = models.CharField(max_length=100)
    invoice_path = models.CharField(max_length=255)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "billing_history"

    def __str__(self):
        return self.transaction_id