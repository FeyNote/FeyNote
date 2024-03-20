FROM node:20-alpine
USER "1000:1000"

WORKDIR /app

COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm ci

COPY tsconfig.base.json tsconfig.base.json
COPY nx.json nx.json

COPY apps apps
COPY libs libs
COPY prisma prisma

RUN npx prisma generate

RUN npx nx run-many -t build

CMD echo "Must provide command to run containers"
