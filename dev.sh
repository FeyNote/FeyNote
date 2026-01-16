#!/usr/bin/env bash
# This script is intended for development use.
# Follow the instructions outlined in the README for selfhost use.

set -e

COMPOSE_FILE="./docker-compose-development.yaml"

case "${1:-}" in
  logs)
    docker compose -f "$COMPOSE_FILE" logs -f frontend docs www backend queue-worker websocket hocuspocus
    ;;

  logs-ui)
    docker compose -f "$COMPOSE_FILE" logs -f frontend docs www
    ;;

  logs-server)
    docker compose -f "$COMPOSE_FILE" logs -f backend queue-worker websocket hocuspocus www
    ;;

  logs-supporting)
    docker compose -f "$COMPOSE_FILE" logs -f proxy postgres typesense valkey nxgraph
    ;;

  up)
    docker compose -f "$COMPOSE_FILE" up -d --build
    docker compose -f "$COMPOSE_FILE" exec backend npx prisma migrate dev
    docker compose -f "$COMPOSE_FILE" exec backend npx nx run search:migrate
    ;;

  down)
    docker compose -f "$COMPOSE_FILE" down
    ;;

  stop)
    docker compose -f "$COMPOSE_FILE" stop
    ;;

  ps)
    docker compose -f "$COMPOSE_FILE" ps
    ;;

  exec)
    shift
    docker compose -f "$COMPOSE_FILE" exec "$@"
    ;;

  *)
    echo "Usage: $0 {logs|logs-ui|logs-server|logs-supporting|up|down|stop|ps|exec}"
    echo ""
    echo "Commands:"
    echo "  logs              - Follow logs for main services"
    echo "  logs-ui           - Follow logs for UI services"
    echo "  logs-server       - Follow logs for server services"
    echo "  logs-supporting   - Follow logs for supporting services"
    echo "  up                - Start services, build, and run migrations"
    echo "  down              - Stop and remove containers"
    echo "  stop              - Stop containers"
    echo "  ps                - Show running containers"
    echo "  exec <args>       - Execute command in container"
    exit 1
    ;;
esac
