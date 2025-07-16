@echo off

echo "[STEP]: Stopping Docker containers..."
docker-compose down -v
if EXIST "Repository\db_data" (
    echo "[STATUS]: Removing db_data directory..."
    rmdir /s /q "Repository\db_data"
)
echo "[STATUS]: Successfully removed data directory."
if EXIST "Repository\logs" (
    echo "[STATUS]: Removing logs directory..."
    rmdir /s /q "Repository\logs"
)
echo "[STATUS]: Successfully removed logs directory."
echo "[STATUS]: Successfully removed containers and data."