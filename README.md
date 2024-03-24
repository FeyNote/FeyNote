# DndAssistant

## Local Start

To run the application locally follow these steps:

1. docker compose up -d --build
2. docker compose exec backend npx prisma migrate dev
3. docker compose exec backend npx nx run prisma-seed:seed:dev

You should now be able to login with credentials to the development user by using the following fields,
Email: dnd-assistant
P: dnd-assistant
