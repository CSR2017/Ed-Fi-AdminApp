#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Up the AdminApp services.
    -Rebuild:$true to rebuild the images before starting.
#>
param(
    # Rebuild the images before starting
    [Switch]
    $Rebuild = $false,

    # Path to the environment file
    [string]$EnvFile = (Join-Path $PSScriptRoot ".env")
)

Write-Host "AdminApp Setup..." -ForegroundColor Cyan

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

# Check if Docker is running
try {
    docker info 2>$null | Out-Null
    Write-Host " Docker is running" -ForegroundColor Green
}
catch {
    Write-Host "ERROR! Docker is not running. Please start Docker first." -ForegroundColor Red
    exit 1
}

# Check if network exists
$networkExists = docker network ls --filter name=edfiadminapp-network --format "{{.Name}}" | Select-String "edfiadminapp-network"
if (-not $networkExists) {
    Write-Host "ERROR! edfiadminapp-network doesn't exist. Creating it..." -ForegroundColor Yellow
    docker network create edfiadminapp-network
    Write-Host " edfiadminapp-network created" -ForegroundColor Green
} else {
    Write-Host " edfiadminapp-network exists" -ForegroundColor Green
}

# Check if required services are running
$db_name = "edfiadminapp-db"
$keycloak_name = "edfiadminapp-keycloak"
$requiredServices = @($db_name, $keycloak_name)
$allRunning = $true

foreach ($service in $requiredServices) {
    $running = docker ps --filter name=$service --filter status=running --format "{{.Names}}" | Select-String $service
    if (-not $running) {
        Write-Host "ERROR! Required service '$service' is not running" -ForegroundColor Red
        $allRunning = $false
    } else {
        Write-Host " $service is running" -ForegroundColor Green
    }
}

if (-not $allRunning) {
    Write-Host "Starting required services..." -ForegroundColor Yellow
    Push-Location ..
    .\up.ps1
    Pop-Location
    
    Write-Host "Waiting for services to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
}

# Wait for database to be ready
Write-Host "Waiting for database to be ready..." -ForegroundColor Yellow
$dbReady = $false
$maxAttempts = 10
$attempt = 0

while (-not $dbReady -and $attempt -lt $maxAttempts) {
    try {
        $dbStatus = docker exec $db_name pg_isready -U postgres
        if ($LASTEXITCODE -eq 0) {
            $dbReady = $true
            Write-Host " Database is ready" -ForegroundColor Green
        }
    }
    catch {
        # Continue waiting
    }
    
    if (-not $dbReady) {
        $attempt++
        Write-Host "Waiting for database... ($attempt/$maxAttempts)" -ForegroundColor Yellow
        Start-Sleep -Seconds 2
    }
}

# Wait for Keycloak to be ready
Write-Host "Please ensure Keycloak have the realm 'edfi' configured and client 'edfiadminapp' created as described in the documentation https://github.com/Ed-Fi-Closed/Ed-Fi-Admin-App/tree/develop/compose#setup-keycloak, then press Y to continue: " -ForegroundColor Yellow -NoNewline
do {
    $userInput = Read-Host
} while ($userInput -ne "Y" -and $userInput -ne "y")

if (-not $dbReady) {
    Write-Host "ERROR! Database failed to become ready" -ForegroundColor Red
    exit 1
}

if ($Rebuild) {
    Write-Host "Rebuilding images as requested..." -ForegroundColor Yellow
    docker compose --env-file $EnvFile build --no-cache edfiadminapp-fe edfiadminapp-api
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR! Services failed to build" -ForegroundColor Red
        exit 1
    }
}

Write-Host "Starting AdminApp services..." -ForegroundColor Yellow
docker compose --env-file $EnvFile up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR! Services failed to start" -ForegroundColor Red
    exit 1
}

# Wait for services to be ready
Write-Host "Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

Write-Host "AdminApp services started successfully!" -ForegroundColor Green
Write-Host "Logs for service API..." -ForegroundColor Yellow
docker compose logs edfiadminapp-api --tail=5
Write-Host "Logs for service Frontend..." -ForegroundColor Yellow
docker compose logs edfiadminapp-fe --tail=5

Write-Host "API: https://localhost/adminapp-api/api" -ForegroundColor Cyan
Write-Host "Frontend: https://localhost/adminapp/" -ForegroundColor Cyan