from datetime import datetime

from pydantic import BaseModel


class SubscriptionRequest(BaseModel):
    plan_name: str


class SubscriptionResponse(BaseModel):
    message: str
    plan_name: str
    price: float
    start_date: datetime
    end_date: datetime
    transaction_id: str
    invoice_path: str


class BillingHistoryResponse(BaseModel):
    id: int
    plan_name: str
    price: float
    start_date: datetime
    end_date: datetime
    transaction_id: str
    invoice_path: str
    created_at: datetime

    class Config:
        from_attributes = True