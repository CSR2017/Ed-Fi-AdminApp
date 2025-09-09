<#
.SYNOPSIS
    Starts the Docker Compose services.

.EXAMPLE
    ./up.ps1
    Starts the Docker Compose services
#>

$networkExists = docker network ls --filter name=edfiadminapp-network --format '{{.Name}}' | Select-String -Pattern 'edfiadminapp-network'
if (-not $networkExists) {
    Write-Host "Creating edfiadminapp-network..." -ForegroundColor Yellow
    docker network create edfiadminapp-network --driver bridge
}

Write-Host "Starting Docker Compose services..." -ForegroundColor Green
docker compose -f docker-compose.yml -f keycloak.yml up -d
Write-Host "Services started successfully!" -ForegroundColor Green
