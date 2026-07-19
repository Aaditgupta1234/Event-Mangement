# Run this script to start the frontend
Write-Host "Starting FestifyXR Frontend..." -ForegroundColor Green
Write-Host ""
Write-Host "Frontend will run on http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Make sure the backend is running on http://localhost:4000" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

Set-Location -Path "$PSScriptRoot\client"
npm run dev
