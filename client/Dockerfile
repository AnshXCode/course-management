# Multi-stage builds (your client-> node, nginx)


FROM node:22-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .


# VITE_API_BASE is baked into the JS at build time
#  — that’s why compose passes it as a build arg.
ARG VITE_API_BASE=http://localhost:5001/api
ENV VITE_API_BASE=$VITE_API_BASE

RUN npm run build






FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
