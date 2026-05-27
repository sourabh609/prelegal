# Prelegal

AI-powered legal agreement drafting. Create, customize and download legal documents via AI chat.

## Running with Docker

**Mac:**
```bash
./scripts/start-mac.sh
./scripts/stop-mac.sh
```

**Linux:**
```bash
./scripts/start-linux.sh
./scripts/stop-linux.sh
```

**Windows (PowerShell):**
```powershell
.\scripts\start-windows.ps1
.\scripts\stop-windows.ps1
```

App runs at **http://localhost:8000**

## Local development

**Backend:**
```bash
cd backend
uv run uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend
npm run dev
```

Set `NEXT_PUBLIC_API_URL=http://localhost:8000` in `frontend/.env.local` when running frontend separately.
