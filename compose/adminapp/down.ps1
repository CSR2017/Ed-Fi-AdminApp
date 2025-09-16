#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Shuts down the Docker Compose services.
#>

Write-Host "Stopping AdminApp services..." -ForegroundColor Yellow

try {
    # Stop and remove containers
    docker compose -f docker-compose.yml down --volumes

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "AdminApp services stopped successfully!" -ForegroundColor Green
    }
    else {
        Write-Host "Failed to stop Admin App services properly." -ForegroundColor Red
    }
}
catch {
    Write-Host "Error stopping Admin App services: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
