@echo off
cd Backend
..\venv311\Scripts\uvicorn.exe Backend:app --host 0.0.0.0 --port 8000
