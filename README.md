# FeyNote

## Local Start

To run the application locally follow these steps:

1. Run ./scripts/localStart.sh

-- OR --

1. cp .example.env .env
2. docker compose up -d --build
3. docker compose exec backend npx prisma migrate dev
4. docker compose exec backend npx nx run search:migrate

## Issue Priority

### Features & Tasks

P1: One of the following -- functionality is highly desired, multiple users have asked for this, we determine this is something we value greatly in the platform
P2: One of the following -- functionality is impactful but does not block the user's experience with the app, multiple users have asked for this but we do not believe this will cause users to look elsewhere
P3: One of the following -- this functionality is worth having in our platform but it can wait, a few users have asked for this but we don't think it's going to cause users to look elsewhere, we see this as niche functionality
P4: One of the following -- this functionality may be worth having in our platform but we don't need to do it with any haste, a user or two have asked for this but it's a niche usecase
Not Planned: We don't see this functionality as a good fit for our platform for one reason or another

### Bugs

P1: One of the following -- This bug breaks the app in a major way blocking user's ability to use the application (perhaps at all), this bug causes data loss, this bug prevents login/signup
P2: One of the following -- This bug breaks the app in a highly visible way blocking the user's ability to use a non-critical portion of the app
P3: One of the following -- This bug breaks the app in a minor way blocking the user's ability to use a non-critical feature of the app, this bug has an easy workaround, this bug affects a small portion of the user base/specific devices
P4: One of the following -- This bug breaks the app in a very minor way, this bug requires effort/bad behavior for the user to create, this bug affects only specific users in a non-blocking manner, we do not think this bug is worth prioritizing
Not Planned: This bug is not something that will affect users or we do not believe it needs to be fixed
