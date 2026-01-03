FROM node:24.7-alpine AS builder

WORKDIR /app

COPY .npmrc .npmrc
COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm ci

COPY tsconfig.base.json tsconfig.base.json
COPY nx.json nx.json
COPY scripts scripts
COPY apps apps
COPY libs libs
COPY prisma prisma

RUN npx prisma generate

ENV NX_NO_CLOUD=true
ARG APP_VERSION=selfhost
ENV APP_VERSION=$APP_VERSION
ENV VITE_APP_VERSION=$APP_VERSION
ENV SELFHOST=true

RUN npx nx run-many -t build -p backend,hocuspocus,queue-worker,websocket,www

FROM node:24.7-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

COPY ./scripts/selfhost/selfhost-unified.sh ./scripts/selfhost/selfhost-unified.sh

ARG APP_VERSION=selfhost
ENV APP_VERSION=$APP_VERSION
ENV VITE_APP_VERSION=$APP_VERSION
ENV NODE_ENV=production
ENV SELFHOST=true
ENV API_PORT=3000
ENV HOCUSPOCUS_WS_PORT=3001
ENV HOCUSPOCUS_REST_PORT=3002
ENV WEBSOCKET_WS_PORT=3003
ENV WEBSOCKET_REST_PORT=3004
ENV WORKER_REST_PORT=3005
ENV WWW_PORT=3006
ENV HOCUSPOCUS_INTERNAL_REST_BASE_URL=http://localhost:3002
ENV LOGGER_LEVEL=info
ENV LOGGER_TRANSPORTS_CONSOLE=true
ENV LOGGER_TRANSPORTS_SENTRY=false

EXPOSE 3000 3001 3002 3003 3004 3005 3006

CMD ["sh", "/app/scripts/selfhost/selfhost-unified.sh"]

