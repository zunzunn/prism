"""Document management router with file upload, validation, secure storage, and authenticated download."""

import os
import re
import uuid
from pathlib import Path
from typing import Any, Optional
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlmodel import Session
from app.auth import get_current_session
from app.config import settings
from app.db import get_session
from app.models import Application, AuditEvent, Document, User, utc_now
from app.routers.applications import _check_app_access
from app.schemas import DocumentRead

router = APIRouter(tags=["Documents"])

MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB
ALLOWED_MIME_TYPES = {
    "application/pdf": [".pdf"],
    "image/png": [".png"],
    "image/jpeg": [".jpg", ".jpeg"],
}


def _verify_magic_bytes(header: bytes) -> str:
    """Verify file magic bytes to prevent MIME spoofing."""
    if header.startswith(b"%PDF-"):
        return "application/pdf"
    if header.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"
    if header.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"
    return ""


def _sanitize_filename(name: str) -> str:
    """Strip dangerous characters and path traversal sequences from original filename."""
    base = Path(name).name
    # Keep alphanumeric, dot, dash, underscore
    clean = re.sub(r"[^a-zA-Z0-9._-]", "_", base)
    return clean or "unnamed_document"


@router.post("/applications/{application_id}/documents", response_model=DocumentRead)
async def upload_document(
    application_id: str,
    file: UploadFile = File(...),
    category: Optional[str] = Form(None),
    session: dict[str, Any] = Depends(get_current_session),
    db: Session = Depends(get_session),
) -> DocumentRead:
    """Upload a supporting document with file validation, secure local storage, and audit logging."""
    app = db.get(Application, application_id)
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application with ID '{application_id}' not found",
        )

    _check_app_access(app, session)

    user_id = session.get("user_id")
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Uploading user profile not found",
        )

    # Validate filename and extension
    original_filename = file.filename or "uploaded_file"
    ext = Path(original_filename).suffix.lower()
    
    # Read first 512 bytes for header validation
    header = await file.read(512)
    verified_mime = _verify_magic_bytes(header)
    
    if not verified_mime or verified_mime not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Please upload a valid PDF, PNG, or JPEG document.",
        )

    if ext not in ALLOWED_MIME_TYPES[verified_mime]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File extension '{ext}' does not match detected content type '{verified_mime}'.",
        )

    # Generate safe server storage key
    safe_name = _sanitize_filename(original_filename)
    unique_key = f"{uuid.uuid4().hex}_{safe_name}"
    storage_path = settings.storage_dir / unique_key

    # Stream write remainder of file while tracking size limit
    total_size = len(header)
    try:
        settings.storage_dir.mkdir(parents=True, exist_ok=True)
        with open(storage_path, "wb") as out_file:
            out_file.write(header)
            while True:
                chunk = await file.read(65536)  # 64 KB
                if not chunk:
                    break
                total_size += len(chunk)
                if total_size > MAX_FILE_SIZE_BYTES:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="File exceeds maximum allowed size of 10 MB.",
                    )
                out_file.write(chunk)
    except Exception as exc:
        if storage_path.exists():
            storage_path.unlink(missing_ok=True)
        if isinstance(exc, HTTPException):
            raise exc
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save document: {str(exc)}",
        )

    # Persist Document record
    doc_id = f"doc-{uuid.uuid4().hex[:8]}"
    now = utc_now()
    document = Document(
        id=doc_id,
        application_id=app.id,
        original_filename=safe_name,
        storage_filename=unique_key,
        mime_type=verified_mime,
        file_size=total_size,
        uploaded_by_id=user.id,
        uploaded_at=now,
        category=category.strip() if category else "Supporting Document",
    )
    db.add(document)

    # Record Audit Event
    audit = AuditEvent(
        id=f"evt-{uuid.uuid4().hex[:8]}",
        actor_id=user.id,
        actor_name=user.display_name,
        actor_role=user.role,
        action="Document uploaded",
        entity_type="document",
        entity_id=doc_id,
        timestamp=now,
        detail=f'{{"filename": "{safe_name}", "file_size": {total_size}, "mime_type": "{verified_mime}"}}',
    )
    db.add(audit)

    # Update application timestamp
    app.updated_at = now
    db.add(app)
    db.commit()
    db.refresh(document)

    return DocumentRead(
        id=document.id,
        application_id=document.application_id,
        original_filename=document.original_filename,
        mime_type=document.mime_type,
        file_size=document.file_size,
        uploaded_by_id=document.uploaded_by_id,
        uploaded_by_name=user.display_name,
        uploaded_at=document.uploaded_at,
        category=document.category,
    )


@router.get("/documents/{document_id}/file")
def get_document_file(
    document_id: str,
    session: dict[str, Any] = Depends(get_current_session),
    db: Session = Depends(get_session),
):
    """Securely download or preview an authorised document."""
    doc = db.get(Document, document_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID '{document_id}' not found",
        )

    app = db.get(Application, doc.application_id)
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associated application not found",
        )

    _check_app_access(app, session)

    file_path = settings.storage_dir / doc.storage_filename
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File content not found in storage",
        )

    return FileResponse(
        path=file_path,
        media_type=doc.mime_type,
        filename=doc.original_filename,
        content_disposition_type="inline",
    )
