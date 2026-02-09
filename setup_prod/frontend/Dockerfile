FROM node:20-bullseye-slim AS build


WORKDIR /app

COPY srcs/frontend/package*.json ./

RUN npm install

COPY srcs/frontend/. .

RUN npm run build

FROM nginx:stable-alpine AS production

COPY --from=build /app/dist /usr/share/nginx/html

COPY docker_prod/frontend/nginx.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
