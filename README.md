# FeyNote

## Local Start

To run the application locally follow these steps:

1. Run ./scripts/localStart.sh

-- OR --

1. docker compose up -d --build
2. docker compose exec backend npx prisma migrate dev
3. docker compose exec backend npx nx run search:migrate
