# PETRO-TWIN AI: Standalone Local Runner for Windows PowerShell
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host " STARTING PETRO-TWIN AI PLATFORM (SIH26120 DEMO MODE)" -ForegroundColor Green
Write-Host " Field: Baghewala Heavy Oil, Rajasthan | Operator: Oil India Ltd" -ForegroundColor Yellow
Write-Host "=================================================================" -ForegroundColor Cyan

# 1. Run tests first to ensure zero regressions
Write-Host "`n[1/3] Running Physics & ML Invariant Tests..." -ForegroundColor Cyan
python scripts/test_all.py
if ($LASTEXITCODE -ne 0) {
    Write-Host "[X] Tests failed! Halting launch." -ForegroundColor Red
    exit 1
}

# 2. Launch FastAPI ML Microservice in Background
Write-Host "`n[2/3] Launching Python ML & Physics Microservice (Port 8000)..." -ForegroundColor Cyan
Start-Process -FilePath "python" -ArgumentList "-m uvicorn ml_service.main:app --host 127.0.0.1 --port 8000" -WindowStyle Minimized

# Wait for ML service to bind
Start-Sleep -Seconds 2

# 3. Launch Vite Frontend
Write-Host "`n[3/3] Launching React Control Room Dashboard (Port 3000 / 5173)..." -ForegroundColor Cyan
Set-Location frontend
npm run dev
