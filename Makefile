# This makefile is intended for development use.
# Follow the instructions outlined in the README for selfhost use.

logs:
	docker compose -f ./docker-compose-development.yaml logs -f frontend docs www backend queue-worker websocket hocuspocus

logs-ui:
	docker compose -f ./docker-compose-development.yaml logs -f frontend docs www

logs-server:
	docker compose -f ./docker-compose-development.yaml logs -f backend queue-worker websocket hocuspocus www

logs-supporting:
	docker compose -f ./docker-compose-development.yaml logs -f proxy postgres typesense valkey nxgraph

up:
	docker compose -f ./docker-compose-development.yaml up -d --build
	docker compose -f ./docker-compose-development.yaml exec backend npx prisma migrate dev
	docker compose -f ./docker-compose-development.yaml exec backend npx nx run search:migrate

down:
	docker compose -f ./docker-compose-development.yaml down

stop:
	docker compose -f ./docker-compose-development.yaml stop

ps:
	docker compose -f ./docker-compose-development.yaml ps

