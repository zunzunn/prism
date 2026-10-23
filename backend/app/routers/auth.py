"""Authentication router providing demo logins, session restoration, and identity verification."""

from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from app.auth import create_session_token, get_current_session
from app.db import get_session
from app.models import Institution, User
from app.schemas import DemoLoginRequest, DemoLoginResponse, UserRead

router = APIRouter(tags=["Authentication"])


@router.post("/demo-login", response_model=DemoLoginResponse)
def demo_login(
    payload: DemoLoginRequest,
    db: Session = Depends(get_session),
) -> DemoLoginResponse:
    """Authenticate with a single click using a designated demo role."""
    role = payload.role.strip().lower()
    allowed_roles = {"institution_user", "officer", "admin"}
    if role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid demo role. Allowed roles: {', '.join(sorted(allowed_roles))}",
        )

    # Select representative demo user for this role
    user = db.exec(select(User).where(User.role == role, User.is_active == True)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No active demo user found for role '{role}'",
        )

    token = create_session_token(
        user_id=user.id,
        role=user.role,
        institution_id=user.institution_id,
    )

    institution_name = None
    if user.institution_id:
        inst = db.get(Institution, user.institution_id)
        if inst:
            institution_name = inst.name

    user_read = UserRead(
        id=user.id,
        display_name=user.display_name,
        email=user.email,
        role=user.role,
        institution_id=user.institution_id,
        institution_name=institution_name,
        created_at=user.created_at,
    )

    return DemoLoginResponse(token=token, user=user_read)


@router.get("/me", response_model=UserRead)
def get_current_user_profile(
    session_data: dict[str, Any] = Depends(get_current_session),
    db: Session = Depends(get_session),
) -> UserRead:
    """Return the profile of the currently authenticated session user."""
    user_id = session_data.get("user_id")
    user = db.get(User, user_id)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found or deactivated",
        )

    institution_name = None
    if user.institution_id:
        inst = db.get(Institution, user.institution_id)
        if inst:
            institution_name = inst.name

    return UserRead(
        id=user.id,
        display_name=user.display_name,
        email=user.email,
        role=user.role,
        institution_id=user.institution_id,
        institution_name=institution_name,
        created_at=user.created_at,
    )


@router.post("/logout")
def logout() -> dict[str, str]:
    """Client logout confirmation."""
    return {"message": "Logged out successfully"}
