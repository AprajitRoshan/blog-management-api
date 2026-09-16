from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile


UPLOAD_DIR = Path("media/posts")
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}


async def save_post_image(image: UploadFile) -> str:
    if not image.filename:
        raise HTTPException(
            status_code=400,
            detail="Invalid image file"
        )

    extension = Path(image.filename).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Unsupported image format. Allowed formats: JPG, JPEG, PNG, GIF, WEBP"
        )

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    filename = f"{uuid4().hex}{extension}"
    file_path = UPLOAD_DIR / filename

    contents = await image.read()

    with open(file_path, "wb") as file:
        file.write(contents)

    return f"/media/posts/{filename}"