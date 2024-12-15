FROM node:22.11-alpine

WORKDIR /app

# dev watch script
RUN apk add --no-cache inotify-tools

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
RUN npx nx run-many -t build --parallel=8

# Include version build arg within the container env
ARG APP_VERSION
ENV APP_VERSION=$APP_VERSION

CMD echo "Must provide command to run containers"
