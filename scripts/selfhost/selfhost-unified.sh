#!/bin/sh

set -e

echo "Starting Feynote..."

echo "Running migrations..."
npx prisma migrate deploy

echo "Updating search indexes..."
node dist/apps/cli/main.js migrateSearchProvider

# Start all services in the background
echo "Starting backend API..."
node dist/apps/backend/main.js &
BACKEND_PID=$!

echo "Starting hocuspocus..."
node dist/apps/hocuspocus/main.js &
HOCUSPOCUS_PID=$!

echo "Starting websocket server..."
node dist/apps/websocket/main.js &
WEBSOCKET_PID=$!

echo "Starting queue-worker..."
node dist/apps/queue-worker/main.js &
WORKER_PID=$!

echo "Starting www..."
node dist/apps/www/server/entry.mjs &
WWW_PID=$!

echo ""
echo "✓ All services started successfully!"
echo "  - Backend API: http://0.0.0.0:${API_PORT:-3000}"
echo "  - Hocuspocus WS: ws://0.0.0.0:${HOCUSPOCUS_WS_PORT:-3001}"
echo "  - Hocuspocus REST: http://0.0.0.0:${HOCUSPOCUS_REST_PORT:-3002}"
echo "  - Websocket: ws://0.0.0.0:${WEBSOCKET_WS_PORT:-3003}"
echo "  - Websocket REST: http://0.0.0.0:${WEBSOCKET_REST_PORT:-3004}"
echo "  - Worker REST: http://0.0.0.0:${WORKER_REST_PORT:-3005}"
echo "  - WWW (Astro): http://0.0.0.0:${WWW_PORT:-3006}"
echo ""

# Function to handle shutdown
shutdown() {
  echo ""
  echo "Shutting down services..."
  kill $BACKEND_PID $HOCUSPOCUS_PID $WEBSOCKET_PID $WORKER_PID $WWW_PID 2>/dev/null || true
  wait
  echo "All services stopped"
  exit 0
}

# Trap signals
trap shutdown SIGTERM SIGINT

# Wait for all background processes
wait
