<#
.SYNOPSIS
    Starts the Docker Compose services.
#>

$networkExists = docker network ls --filter name=sbaa-network --format '{{.Name}}' | Select-String -Pattern 'sbaa-network'
if (-not $networkExists) {
    docker network create sbaa-network --driver bridge
}

New-Item -Path logs -ItemType Directory -Force | Out-Null

docker compose -f docker-compose.yml -f keycloak.yml up -d
