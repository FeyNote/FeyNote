FROM node:24.2-alpine

WORKDIR /app

# dev watch script
RUN apk update
RUN apk add --no-cache inotify-tools
RUN apk add --no-cache pandoc
RUN npm install -g tsx

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

ARG APP_VERSION
# Include version build arg within the container env
ENV APP_VERSION=$APP_VERSION
ENV VITE_APP_VERSION=$APP_VERSION

CMD echo "Must provide command to run containers"
