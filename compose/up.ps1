<#
.SYNOPSIS
    Starts the Docker Compose services.

.EXAMPLE
    ./up.ps1
    Starts the Docker Compose services
#>

$networkExists = docker network ls --filter name=sbaa-network --format '{{.Name}}' | Select-String -Pattern 'sbaa-network'
if (-not $networkExists) {
    Write-Host "Creating sbaa-network..." -ForegroundColor Yellow
    docker network create sbaa-network --driver bridge
}

Write-Host "Starting Docker Compose services..." -ForegroundColor Green
docker compose -f docker-compose.yml -f keycloak.yml up -d
Write-Host "Services started successfully!" -ForegroundColor Green
