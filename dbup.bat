@echo off
setlocal enabledelayedexpansion

echo [STEP]: Starting Docker containers...
docker-compose up -d
if !errorlevel! neq 0 (
    echo [ERR]: Failed to start Docker containers.
    exit /b %errorlevel%
)

echo [STATUS]: Waiting for services to be ready...
set MAX_ATTEMPTS=30
set INTERVAL=10

for /L %%i in (1,1,%MAX_ATTEMPTS%) do (
    set "all_ready=true"

    REM Check Redis connection
    docker exec -i redis_container redis-cli ping >nul 2>&1
    if !errorlevel! neq 0 (
        echo [STATUS]: Wait for Redis connection to be ready.
        set "all_ready=false"
    )

    REM Check Postgres connection
    docker exec -i Postgres_container psql -U postgres -d ecommerce_db -c "SELECT 1" >nul 2>&1
    if !errorlevel! neq 0 (
        echo [STATUS]: Waiting for PostgreSQL...
        set "all_ready=false"
    )
    
    REM Exit if all services are ready
    if "!all_ready!"=="true" (
        echo [STATUS]: All services are ready!
        goto all_ready
    )
    echo [STATUS]: Retrying in %INTERVAL% seconds...
    timeout /t %INTERVAL% >nul
)

echo [ERR]: Timeout waiting for services.
exit /b 1


:all_ready

echo [STEP]: Migrating PostgreSQL...
docker cp ".\BE\src\Repository\Migration_scripts\postgres" Postgres_container:/migrations/
if %errorlevel% neq 0 (
    echo [ERR]: Failed to copy migration scripts to Redis container.
    exit /b %errorlevel%
)
for %%f in (.\BE\src\Repository\Migration_scripts\postgres\*.sql) do (
    echo Executing %%~nxf...
    @echo off
    docker exec -i Postgres_container psql -U postgres -d ecommerce_db -f /migrations/%%~nxf>nul
    if !errorlevel! neq 0 (
        echo [ERR]: Failed executing %%~nxf in PostgreSQL
    )
)
echo [STATUS]: PostgreSQL migration completed.

echo [STATUS]: Initializing Redis with data...

docker cp ".\BE\src\Repository\migration_scripts\redis" redis_container:/data/
if %errorlevel% neq 0 (
    echo [ERR]: Failed to copy migration scripts to Redis container.
    exit /b %errorlevel%
)
for %%f in (.\BE\src\Repository\migration_scripts\redis\*.rdb) do (
    echo Restoring %%~nxf...
    docker exec -i redis_container sh -c "cat /data/redis/%%~nxf | redis-cli --pipe"
    if %errorlevel% neq 0 (
        echo "[ERR]: Failed to restore %%~nxf into Redis. Continuing with the next file..."
    )
)

echo [STATUS]: Redis migration completed

echo [STATUS]: Enable the Rabbitmq stream and stream management plugins

docker exec rabbitmq-stream rabbitmq-plugins enable rabbitmq_stream rabbitmq_stream_management>nul 2>&1

echo [STATUS]: RabbitMQ plugins enabled.

echo [SUCCESS]: All services initialized successfully!
