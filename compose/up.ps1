<#
.SYNOPSIS
    Starts the Docker Compose services.

.EXAMPLE
    ./up.ps1
    Starts the Docker Compose services
    If the edfiadminapp-network does not exist, it will be created.
    If the -AdminApp switch is provided as $false, it won't start the AdminApp services.
    If the -Rebuild switch is provided as $true, it will rebuild the AdminApp images before starting them.
#>

param(
    # Start AdminApp services after starting base services
    [Switch]
    $AdminApp,

    # Rebuild the images before starting
    [Switch]
    $Rebuild
)

$networkExists = docker network ls --filter name=edfiadminapp-network --format '{{.Name}}' | Select-String -Pattern 'edfiadminapp-network'
if (-not $networkExists) {
    Write-Host "Creating edfiadminapp-network..." -ForegroundColor Yellow
    docker network create edfiadminapp-network --driver bridge
}

Write-Host "Starting Docker Compose services..." -ForegroundColor Green
docker compose -f docker-compose.yml -f keycloak.yml up -d
Write-Host "Services started successfully!" -ForegroundColor Green

if ($AdminApp) {
    Push-Location adminapp
    .\up.ps1 -Rebuild:$Rebuild -EnvFile (Join-Path $PSScriptRoot ".env")
    Pop-Location
}
