# Run this script to start the backend server
Write-Host "Starting FestifyXR Backend Server..." -ForegroundColor Green
Write-Host ""
Write-Host "Server will run on http://localhost:4000" -ForegroundColor Cyan
Write-Host "API endpoints available at http://localhost:4000/api" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

Set-Location -Path "$PSScriptRoot\server"
npm run dev
