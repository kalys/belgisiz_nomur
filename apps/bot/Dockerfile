FROM node:25-alpine AS base
RUN npm install -g pnpm

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/bot/package.json ./apps/bot/
COPY packages/phone-utils/package.json ./packages/phone-utils/
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
ENV CI=true
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm --filter @belgisiz-nomur/phone-utils build
RUN pnpm --filter @belgisiz-nomur/bot build
RUN pnpm --filter @belgisiz-nomur/bot deploy --prod --legacy /app/deploy
# dist/ is gitignored so pnpm deploy skips it — copy explicitly
RUN cp -r apps/bot/dist /app/deploy/dist

FROM node:25-alpine AS runner
WORKDIR /app
COPY --from=builder /app/deploy .
CMD ["node", "dist/index.js"]
