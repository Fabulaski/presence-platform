# ─── Production Dockerfile for Presence Platform Monorepo ───────────────────
FROM node:20-alpine AS base

# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy monorepo configuration files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.json ./

# Copy all packages and apps
COPY packages ./packages
COPY apps ./apps

# Install all workspace dependencies
RUN pnpm install --frozen-lockfile

# Build all workspace packages
RUN pnpm build

# Expose ports
EXPOSE 3000 3001 3005

# Default start command
CMD ["pnpm", "start"]
