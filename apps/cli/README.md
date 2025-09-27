# CLI

Running in dev should be done in the backend container:

1. Exec into the backend container `docker compose exec backend sh`
2. Build the CLI `npx nx build cli`
3. Run the desired CLI command with `node dist/apps/cli/main.js` (followed by any argument/command you wish to run)
