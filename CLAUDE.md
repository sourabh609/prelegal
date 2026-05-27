# Prelegal Project

## Overview

This is a SaaS product to allow users to draft legal agreements based on templates in the templates directory.
The user can carry out AI chat in order to establish what document they want and how to fill in the fields.
The available documents are covered in the catalog.json file in the project root, included here:

@catalog.json

## Implementation status

- **PL-1** ✅ Legal templates dataset — 12 CommonPaper templates in `templates/`, catalog in `catalog.json`
- **PL-2** ✅ Mutual NDA creator — two-panel form + live preview + PDF download
- **PL-3** ✅ V1 foundation — FastAPI backend, SQLite auth, static frontend served by FastAPI, Docker, scripts

## Development process

When instructed to build a feature:
1. Use your Atlassian tools to read the feature instructions from Jira
2. Develop the feature - do not skip any step from the feature-dev 7 step process
3. Thoroughly test the feature with unit tests and integration tests and fix any issues
4. Submit a PR using your github tools

## Current architecture

### Backend (`backend/`)
- FastAPI app, uv project, runs at `http://localhost:8000`
- SQLite database (`prelegal.db`) — recreated from scratch on each startup
- `users` table: id, email, hashed_password, created_at
- Auth endpoints: `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/auth/me`
- JWT tokens (HS256, 24h expiry), bcrypt password hashing
- Serves compiled Next.js static files from `backend/static/` when present

Key files:
- `backend/main.py` — FastAPI app, lifespan startup, static file mount
- `backend/app/database.py` — SQLAlchemy models, `init_db()`, `get_db()`
- `backend/app/auth.py` — JWT helpers, bcrypt hashing
- `backend/app/routes.py` — auth API routes

### Frontend (`frontend/`)
- Next.js 16, React 19, Tailwind CSS v4
- `output: 'export'` in `next.config.ts` — produces static files in `out/`
- Auth state: `lib/auth.tsx` (AuthProvider + useAuth hook), token stored in localStorage
- API client: `lib/api.ts` — wraps fetch with bearer token injection
- Pages: `/` (NDA creator, auth-gated), `/auth/` (sign in / create account)
- Brand colors defined as CSS vars in `app/globals.css`

### Docker
- Multi-stage `Dockerfile`: Node build stage → Python runtime
- Frontend `out/` copied to `backend/static/`, served by FastAPI
- `docker build -t prelegal . && docker run --env-file .env -p 8000:8000 prelegal`

### Scripts
- `scripts/start-{mac,linux}.sh` / `scripts/stop-{mac,linux}.sh`
- `scripts/start-windows.ps1` / `scripts/stop-windows.ps1`

## AI design

When writing code to make calls to LLMs, use OpenRouter to the `openrouter/openai/gpt-oss-120b` model. You should use Structured Outputs so that you can interpret the results and populate fields in the legal document.

There is an OPENROUTER_API_KEY in the .env file in the project root.

## Color Scheme
- Accent Yellow: `#ecad0a`
- Blue Primary: `#209dd7`
- Purple Secondary: `#753991` (submit buttons)
- Dark Navy: `#032147` (headings)
- Gray Text: `#888888`
