FROM node:20-bullseye-slim AS build


WORKDIR /app

COPY srcs/backend/package*.json ./

RUN npm install

COPY srcs/backend/. .

RUN npm run build

FROM nginx:stable-alpine AS production

COPY --from=build /app/dist /usr/share/nginx/html

COPY docker_prod/backend/nginx.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
