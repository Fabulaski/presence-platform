# ==============================================================================
# PRESENCE PLATFORM - MULTI-STAGE DOCKERFILE
# ==============================================================================

# Base Stage
FROM node:20-alpine AS base
WORKDIR /app
RUN npm install -g pnpm

# Dependencies Stage
FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages/types/package.json ./packages/types/
COPY packages/events/package.json ./packages/events/
COPY packages/core/package.json ./packages/core/
COPY packages/sdk/package.json ./packages/sdk/
COPY packages/database/package.json ./packages/database/
COPY packages/cli/package.json ./packages/cli/
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY apps/widget/package.json ./apps/widget/
COPY apps/creator-demo/package.json ./apps/creator-demo/
COPY apps/radio-demo/package.json ./apps/radio-demo/
COPY apps/dev-demo/package.json ./apps/dev-demo/
RUN pnpm install

# Build Stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm --filter @presence/database db:generate
RUN pnpm build

# Production Runner Stage (API Server)
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001

COPY --from=builder /app ./

EXPOSE 3001

CMD ["node", "apps/api/dist/index.js"]
