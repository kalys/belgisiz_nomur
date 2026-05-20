FROM node:25-alpine AS base
RUN npm install -g pnpm

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/phone-utils/package.json ./packages/phone-utils/
COPY packages/ui/package.json ./packages/ui/
COPY packages/config/package.json ./packages/config/
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
ENV CI=true
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm --filter @belgisiz-nomur/phone-utils build
RUN pnpm --filter @belgisiz-nomur/ui build
RUN pnpm --filter @belgisiz-nomur/config build
# NEXT_PUBLIC_API_URL is baked in at build time
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
RUN pnpm --filter @belgisiz-nomur/web build

FROM node:25-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=3000
# Standalone output includes all traced server deps
COPY --from=builder /app/apps/web/.next/standalone ./
# Static files and public assets are not included in standalone
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
