#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

if ! command -v docker &>/dev/null; then
  echo "Docker is not installed. See https://docs.docker.com/engine/install/"
  exit 1
fi

echo "Building and starting Prelegal..."
docker build -t prelegal .
docker run -d \
  --name prelegal \
  --env-file .env \
  -p 8000:8000 \
  prelegal

echo "Prelegal is running at http://localhost:8000"
