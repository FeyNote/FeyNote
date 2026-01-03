# FeyNote Self-Hosting

This readme contains the instructions you need to self-host FeyNote on your home server.

## Overview

FeyNote's self-hosting setup consolidates all backend services (API, WebSocket, Hocuspocus, Queue Worker, and Marketing Website) into a single container for ease of use. You only need to run:

- **1 application container** - All FeyNote backend services
- **1 static proxy container** - Nginx serving frontend, docs, and routing to backend
- **3 supporting services** - PostgreSQL, Redis, and Typesense

## Quick Start

1. **Grab the latest selfhost configs:**
   https://github.com/FeyNote/FeyNote/tree/main/selfhosting-toolkit

   You'll need both the docker-compose.yaml and the selfhost.env file, both in the same directory

1. **Configure env:**
   Edit selfhost.env with your settings (at minimum, change passwords)

1. **Start FeyNote:**

   ```bash
   docker-compose up -d
   ```

1. **Access FeyNote:**
   - Open your browser to `http://localhost:7271` (or your configured port)
   - The frontend application will be available at `/`
   - Documentation will be at `/docs/`
   - The landing website will be at `/www/`

1. **Configure Your Reverse Proxy:**
   Point your personal reverse proxy (whatever you use for all of your other self-hosted services) with your domain (with HTTPS!) at http://localhost:7271

## Configuration

Edit `.env` and set these required values:

```bash
POSTGRES_PASSWORD=your-secure-password
TYPESENSE_API_KEY=your-secure-api-key
```

## Data Persistence

All data is stored in Docker volumes:

- `postgres_data` - Database (back this up!)
- `app_data` - File uploads and attachments (back this up!)
- `typesense_data` - Search indices (not critical if lost)

### Backup

To backup your data:

```bash
# Backup database
docker-compose exec postgres pg_dump -U feynote feynote > backup.sql

# Backup file uploads
docker cp $(docker-compose ps -q app):/app/data ./backup-data
```

### Restore

To restore from backup:

```bash
# Restore database
cat backup.sql | docker-compose exec -T postgres psql -U feynote feynote

# Restore file uploads
docker cp ./backup-data $(docker-compose ps -q app):/app/data
```

## Updating

To update to a new version, please grab the new configuration files under the corresponding release in GitHub and follow any notes related to upgrading in the UPGRADING.md file associated.

Please always use a docker-compose.yaml as-is, and do not change verison numbers for the FeyNote containers within without updating the rest of the docker-compose.yaml to the latest version we provide here. docker-compose.yaml and release versions for FeyNote are tightly coupled.

## License

The same license that applies to FeyNote code applies to the selfhost containers and all related code. See the [license here]("../LICENSE.md") for info.
