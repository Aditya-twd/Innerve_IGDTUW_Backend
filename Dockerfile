# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS build

WORKDIR /app

# Install dependencies first for better layer caching.
COPY package*.json ./
RUN npm ci

# Copy Prisma schema and generate client.
COPY prisma ./prisma
RUN npx prisma generate

# Copy application source.
COPY . .

# Keep runtime image lean by removing dev dependencies.
RUN npm prune --omit=dev

FROM node:20-bookworm-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app /app

EXPOSE 4000
CMD ["node", "server.js"]
