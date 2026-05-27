# Start Prelegal on Windows
$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectDir = Split-Path -Parent $ScriptDir

Set-Location $ProjectDir

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error "Docker is not installed. Please install Docker Desktop for Windows."
    exit 1
}

Write-Host "Building and starting Prelegal..."
docker build -t prelegal .
docker run -d `
    --name prelegal `
    --env-file .env `
    -p 8000:8000 `
    prelegal

Write-Host "Prelegal is running at http://localhost:8000"
