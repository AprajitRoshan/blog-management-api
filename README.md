# Blog Management API

A simple Blog Management API built using FastAPI. This project provides APIs for user authentication, blog posts, comments, likes, and email notifications.

## Technologies Used

- Python
- FastAPI
- SQLAlchemy
- SQLite
- JWT Authentication
- Pydantic
- Passlib + Bcrypt
- SMTP Email
- Swagger UI

## Features

- User registration and login
- JWT-based authentication
- Password hashing
- Create, view, update and delete blog posts
- Users can only update or delete their own posts
- View posts created by the logged-in user
- Add and view comments
- Like and unlike posts
- Prevent duplicate likes
- Input validation using Pydantic
- Email notifications for new comments
- Email notifications for new likes
- Interactive Swagger API documentation

## Project Structure

    blog_api/
    ├── app/
    │   ├── core/
    │   │   ├── config.py
    │   │   ├── database.py
    │   │   ├── dependencies.py
    │   │   └── security.py
    │   ├── models/
    │   │   ├── user.py
    │   │   ├── post.py
    │   │   ├── comment.py
    │   │   └── like.py
    │   ├── routes/
    │   │   ├── auth.py
    │   │   ├── posts.py
    │   │   ├── comments.py
    │   │   └── likes.py
    │   ├── schemas/
    │   │   ├── auth.py
    │   │   ├── user.py
    │   │   ├── post.py
    │   │   └── comment.py
    │   ├── services/
    │   │   └── email.py
    │   ├── main.py
    │   └── __init__.py
    ├── requirements.txt
    ├── .gitignore
    └── README.md

## Database Models

The application uses SQLite with SQLAlchemy ORM.

### User
- id
- username
- email
- password

### Post
- id
- title
- content
- author_id
- created_at

### Comment
- id
- post_id
- user_id
- text
- created_at

### Like
- id
- post_id
- user_id

A unique constraint is used to prevent a user from liking the same post multiple times.

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login and receive JWT token |

### Posts

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/posts` | Create a new post |
| GET | `/posts` | Get all posts |
| GET | `/posts/mine` | Get current user's posts |
| GET | `/posts/{post_id}` | Get a specific post |
| PUT | `/posts/{post_id}` | Update own post |
| DELETE | `/posts/{post_id}` | Delete own post |

### Comments

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/posts/{post_id}/comments` | Add a comment |
| GET | `/posts/{post_id}/comments` | Get comments for a post |

### Likes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/posts/{post_id}/likes` | Like a post |
| DELETE | `/posts/{post_id}/likes` | Unlike a post |

## Authentication

The API uses JWT Bearer Authentication.

After logging in, copy the returned access token and use the **Authorize** button in Swagger UI.

Protected operations include creating posts, updating posts, deleting posts, creating comments, and liking or unliking posts.

Users can only update or delete posts that they own.

## Email Notifications

The application supports email notifications using SMTP.

Notifications are sent when another user:

- Comments on your post
- Likes your post

SMTP credentials are stored in the `.env` file and are excluded from Git using `.gitignore`.

Example:

    SMTP_HOST=smtp.gmail.com
    SMTP_PORT=587
    SMTP_USERNAME=your-email@gmail.com
    SMTP_PASSWORD=your-app-password

Do not commit real email passwords or credentials to GitHub.

## Installation

### 1. Clone the repository

    git clone https://github.com/AprajitRoshan/blog-management-api.git
    cd blog-management-api

### 2. Create a virtual environment

Windows:

    python -m venv venv

### 3. Activate the virtual environment

Windows PowerShell:

    venv\Scripts\Activate.ps1

### 4. Install dependencies

    pip install -r requirements.txt

### 5. Configure environment variables

Create a `.env` file in the project root and add your SMTP configuration.

    SMTP_HOST=smtp.gmail.com
    SMTP_PORT=587
    SMTP_USERNAME=your-email@gmail.com
    SMTP_PASSWORD=your-app-password

### 6. Run the application

    uvicorn app.main:app --reload

The API will be available at:

    http://127.0.0.1:8000

## Swagger Documentation

FastAPI provides interactive API documentation through Swagger UI.

Open:

    http://127.0.0.1:8000/docs

Swagger can be used to:

- Register users
- Login
- Authorize using JWT
- Create and manage posts
- Add comments
- Like and unlike posts
- Test protected endpoints

## Database

The project uses SQLite as the database.

The database file is created automatically when the application starts:

    blog.db

The database contains:

- users
- posts
- comments
- likes

The database file is excluded from Git using `.gitignore`.

## Validation and Error Handling

The API handles common errors such as:

- Duplicate usernames
- Duplicate email addresses
- Invalid login credentials
- Invalid or expired JWT tokens
- Non-existent posts
- Unauthorized post updates or deletions
- Duplicate likes
- Invalid request data

## Project Purpose

This project was created to practice backend API development using FastAPI, SQLAlchemy, JWT authentication, database relationships, input validation, and email notifications.

## Author

**Aprajit Roshan**

GitHub: https://github.com/AprajitRoshan/blog-management-api