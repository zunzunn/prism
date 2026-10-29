# CREDEN Backend

FastAPI backend service powering the CREDEN AICTE Student Data Management and Academic Verification Platform.

## Quickstart

```bash
uv venv .venv
source .venv/bin/activate
uv pip install -e .
uv pip install pytest pytest-asyncio
uvicorn app.main:app --reload --port 8000
```

## Health Check
- `GET /api/health`
- Swagger UI at `/docs`
