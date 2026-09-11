import os
import smtplib
from email.message import EmailMessage
from pathlib import Path

from dotenv import load_dotenv


# Get the project root:
# blog_api/
# ├── .env
# └── app/
#     └── services/
#         └── email.py
BASE_DIR = Path(__file__).resolve().parents[2]

# Explicitly load the .env from the project root
load_dotenv(BASE_DIR / ".env")


def send_email(to_email: str, subject: str, body: str):
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_username = os.getenv("SMTP_USERNAME")
    smtp_password = os.getenv("SMTP_PASSWORD")

    print("SMTP HOST:", smtp_host)
    print("SMTP USERNAME:", smtp_username)
    print("SMTP PASSWORD LOADED:", bool(smtp_password))

    if not all([smtp_host, smtp_username, smtp_password]):
        print("SMTP configuration missing. Email notification skipped.")
        return

    message = EmailMessage()
    message["From"] = smtp_username
    message["To"] = to_email
    message["Subject"] = subject
    message.set_content(body)

    try:
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_username, smtp_password)
            server.send_message(message)

        print(f"Email sent successfully to {to_email}")

    except Exception as e:
        print(f"Email sending failed: {e}")