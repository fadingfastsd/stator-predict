# Launch Stator Predict Application
$htmlPath = Join-Path $PSScriptRoot "index.html"
Write-Host "Opening Stator Predict in your default browser..." -ForegroundColor Cyan
Start-Process $htmlPath
Write-Host "Stator Predict launched successfully!" -ForegroundColor Green
