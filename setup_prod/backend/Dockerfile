FROM node:20-bookworm-slim AS dependencies

WORKDIR /app

RUN apt-get update -y && apt-get install -y --no-install-recommends \
    git gcc g++ make build-essential python3 cmake \
    && rm -rf /var/lib/apt/lists/*

COPY srcs/backend/package*.json ./

RUN npm ci

FROM dependencies AS build

WORKDIR /app

COPY srcs/backend/. .

RUN npm run build

FROM node:20-bookworm-slim AS production

WORKDIR /app

ENV NODE_ENV=production

RUN apt-get update -y && apt-get install -y --no-install-recommends \
    git gcc g++ make build-essential python3 cmake \
    && rm -rf /var/lib/apt/lists/*

COPY srcs/backend/package*.json ./

RUN npm ci --only=production && npm cache clean --force

COPY --from=build /app/dist ./dist

EXPOSE 8080

CMD ["sh", "-c", "npm run migration:run && exec npm run start:prod"]