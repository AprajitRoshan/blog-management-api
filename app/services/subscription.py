from datetime import datetime, timedelta
from pathlib import Path
from uuid import uuid4

from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from sqlalchemy.orm import Session

from app.models.billing_history import BillingHistory
from app.models.subscription_plan import SubscriptionPlan
from app.models.user import User


BASE_DIR = Path(__file__).resolve().parents[2]
INVOICE_DIR = BASE_DIR / "media" / "invoices"

INVOICE_DIR.mkdir(parents=True, exist_ok=True)


def generate_transaction_id():
    return f"TXN-{uuid4().hex[:12].upper()}"


def generate_invoice(
    user: User,
    plan: SubscriptionPlan,
    start_date: datetime,
    end_date: datetime,
    transaction_id: str
):
    invoice_filename = f"invoice_{transaction_id}.pdf"
    invoice_path = INVOICE_DIR / invoice_filename

    pdf = canvas.Canvas(str(invoice_path), pagesize=A4)

    width, height = A4

    pdf.setFont("Helvetica-Bold", 20)
    pdf.drawString(50, height - 60, "Blog Management API")

    pdf.setFont("Helvetica-Bold", 16)
    pdf.drawString(50, height - 100, "Subscription Invoice")

    pdf.setFont("Helvetica", 11)

    y = height - 150

    invoice_details = [
        ("User Name", user.username),
        ("Email", user.email),
        ("Plan", plan.name),
        ("Price", f"INR {plan.price:.2f}"),
        ("Start Date", start_date.strftime("%Y-%m-%d")),
        ("End Date", end_date.strftime("%Y-%m-%d")),
        ("Transaction ID", transaction_id),
    ]

    for label, value in invoice_details:
        pdf.setFont("Helvetica-Bold", 11)
        pdf.drawString(50, y, f"{label}:")

        pdf.setFont("Helvetica", 11)
        pdf.drawString(180, y, str(value))

        y -= 30

    pdf.setFont("Helvetica-Bold", 11)
    pdf.drawString(
        50,
        y - 20,
        "Thank you for subscribing!"
    )

    pdf.save()

    return f"/media/invoices/{invoice_filename}"


def subscribe_user(
    db: Session,
    user: User,
    plan: SubscriptionPlan
):
    start_date = datetime.utcnow()
    end_date = start_date + timedelta(days=30)

    transaction_id = generate_transaction_id()

    invoice_path = generate_invoice(
        user=user,
        plan=plan,
        start_date=start_date,
        end_date=end_date,
        transaction_id=transaction_id
    )

    user.subscription_plan_id = plan.id

    billing = BillingHistory(
        user_id=user.id,
        subscription_plan_id=plan.id,
        plan_name=plan.name,
        price=plan.price,
        start_date=start_date,
        end_date=end_date,
        transaction_id=transaction_id,
        invoice_path=invoice_path
    )

    db.add(billing)
    db.commit()
    db.refresh(billing)

    return billing