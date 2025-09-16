$db_name = "edfiadminapp-db"
$local_sql_file = Join-Path $PSScriptRoot "seed-oidc.sql"  # Path to SQL file relative to script location

# Copy the SQL file to the container
docker cp $local_sql_file ${db_name}:/tmp/seed-oidc.sql

# Execute the SQL file
docker exec $db_name psql -U postgres -d sbaa -f /tmp/seed-oidc.sql

# Optional: Clean up the temporary file
docker exec $db_name rm /tmp/seed-oidc.sql