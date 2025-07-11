@echo off

echo "[STEP]: Stopping Docker containers..."
docker-compose down -v
if EXIST "BE\src\Repository\db_data" (
    echo "[STATUS]: Removing db_data directory..."
    rmdir /s /q "BE\src\Repository\db_data"
)
echo "[STATUS]: Successfully removed data directory."
if EXIST "BE\src\Repository\logs" (
    echo "[STATUS]: Removing logs directory..."
    rmdir /s /q "BE\src\Repository\logs"
)
echo "[STATUS]: Successfully removed logs directory."
echo "[STATUS]: Successfully removed containers and data."