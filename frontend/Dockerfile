# Stage 1 — build Angular app
FROM node:22.14-alpine AS builder

WORKDIR /app

ARG ENVIRONMENT="docker"

COPY package*.json ./
RUN npm install

COPY . .
RUN npx ng build --configuration=$ENVIRONMENT

# Stage 2 — serve with nginx
FROM nginx:alpine AS runner

RUN apk add --no-cache curl

COPY --from=builder /app/dist/focus-frappe/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost/ || exit 1