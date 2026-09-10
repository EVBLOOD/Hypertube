FROM node:20-bookworm-slim AS build

WORKDIR /app

RUN apt-get update -y && apt-get install -y --no-install-recommends \
    git gcc build-essential python3 \
    && rm -rf /var/lib/apt/lists/*

COPY srcs/backend/package*.json ./

RUN npm ci

COPY srcs/backend/. .

RUN npm run build

RUN npm prune --production

FROM node:20-bookworm-slim AS production

WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./

EXPOSE 8080

CMD ["sh", "-c", "npm run migration:run && exec npm run start:prod"]