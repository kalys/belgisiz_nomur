FROM node:25-alpine AS base
RUN npm install -g pnpm

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/phone-utils/package.json ./packages/phone-utils/
COPY packages/config/package.json ./packages/config/
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
ENV CI=true
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm --filter @belgisiz-nomur/phone-utils build
RUN pnpm --filter @belgisiz-nomur/config build
RUN pnpm --filter @belgisiz-nomur/api exec prisma generate
RUN pnpm --filter @belgisiz-nomur/api build
RUN pnpm --filter @belgisiz-nomur/api deploy --prod --legacy /app/deploy
# Copy schema + config so prisma generate works in the deploy dir
COPY apps/api/prisma /app/deploy/prisma
COPY apps/api/prisma.config.ts /app/deploy/prisma.config.ts
RUN cd /app/deploy && node_modules/.bin/prisma generate

FROM node:25-alpine AS runner
WORKDIR /app
COPY --from=builder /app/deploy .
CMD ["node", "dist/index.js"]
