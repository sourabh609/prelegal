# Stage 1: Build Next.js static export
FROM node:22-alpine AS frontend-build

WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci --quiet
COPY frontend/ ./
RUN npm run build


# Stage 2: Python runtime with FastAPI
FROM python:3.12-slim

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

WORKDIR /app

# Install backend dependencies
COPY backend/pyproject.toml backend/uv.lock* ./
RUN uv sync --frozen --no-dev 2>/dev/null || uv sync --no-dev

# Copy backend source
COPY backend/ ./

# Copy compiled frontend into the static directory FastAPI serves
COPY --from=frontend-build /frontend/out ./static

# Expose port
EXPOSE 8000

CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
