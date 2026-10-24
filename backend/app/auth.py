"""Cryptographically secure session management and authorization helpers."""

import base64
import hashlib
import hmac
import json
import time
from typing import Any, Optional
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from app.config import settings

security = HTTPBearer(auto_error=False)


def _b64_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("utf-8").rstrip("=")


def _b64_decode(data: str) -> bytes:
    padding = 4 - (len(data) % 4)
    if padding and padding != 4:
        data += "=" * padding
    return base64.urlsafe_b64decode(data.encode("utf-8"))


def create_session_token(user_id: str, role: str, institution_id: Optional[str] = None) -> str:
    """Create an HMAC-SHA256 signed session token."""
    now = int(time.time())
    exp = now + (settings.session_expiry_hours * 3600)
    
    payload = {
        "user_id": user_id,
        "role": role,
        "institution_id": institution_id,
        "iat": now,
        "exp": exp,
    }
    
    payload_json = json.dumps(payload, separators=(",", ":"), sort_keys=True).encode("utf-8")
    payload_b64 = _b64_encode(payload_json)
    
    sig = hmac.new(
        settings.secret_key.encode("utf-8"),
        payload_b64.encode("utf-8"),
        hashlib.sha256
    ).digest()
    sig_b64 = _b64_encode(sig)
    
    return f"{payload_b64}.{sig_b64}"


def decode_session_token(token: str) -> dict[str, Any]:
    """Validate and decode HMAC-SHA256 signed session token."""
    parts = token.split(".")
    if len(parts) != 2:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token format",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    payload_b64, sig_b64 = parts[0], parts[1]
    
    expected_sig = hmac.new(
        settings.secret_key.encode("utf-8"),
        payload_b64.encode("utf-8"),
        hashlib.sha256
    ).digest()
    
    try:
        provided_sig = _b64_decode(sig_b64)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token signature encoding",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if not hmac.compare_digest(expected_sig, provided_sig):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token signature",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    try:
        payload_bytes = _b64_decode(payload_b64)
        payload = json.loads(payload_bytes.decode("utf-8"))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Malformed token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if int(time.time()) > payload.get("exp", 0):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    return payload


async def get_current_session(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> dict[str, Any]:
    """Dependency that extracts and validates the session token from Authorization header or ?token= query parameter."""
    token: Optional[str] = None
    if credentials and credentials.credentials:
        token = credentials.credentials
    elif "token" in request.query_params and request.query_params["token"]:
        token = request.query_params["token"]

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return decode_session_token(token)


def require_roles(*allowed_roles: str):
    """Dependency factory restricting access to specified roles."""
    async def role_checker(session: dict[str, Any] = Depends(get_current_session)) -> dict[str, Any]:
        user_role = session.get("role")
        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role: {', '.join(allowed_roles)}",
            )
        return session
    return role_checker
