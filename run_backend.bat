@echo off
echo Starting LEARNOVA AI Backend Server (FastAPI)...
echo API Docs will be available at: http://127.0.0.1:8000/docs
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
pause
