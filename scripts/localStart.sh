#!/bin/sh

[ ! -f .env ] && cp .example.env .env
docker compose up -d --build
docker compose exec backend npx prisma migrate dev
docker compose exec backend npx nx run search:migrate

