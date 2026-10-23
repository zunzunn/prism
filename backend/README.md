# PRISM Backend

FastAPI backend for PRISM (Proactive Regulatory Intelligence & Status Monitoring).

## Setup & Running

Using `uv` (recommended):
```bash
cd backend
uv venv
uv pip install -r requirements.txt
uv run uvicorn main:app --reload --port 8000
```

Or using standard Python:
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## Health Check
- GET `http://localhost:8000/api/health`
- OpenAPI docs: `http://localhost:8000/docs`
