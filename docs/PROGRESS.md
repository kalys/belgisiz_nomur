# Belgisiz Nomur — Progress

## Phase 0 — Foundation ✅
- [x] Turborepo + pnpm workspaces
- [x] `apps/api`, `apps/web`, `apps/bot`, `apps/mobile` scaffolded
- [x] `packages/phone-utils`, `packages/config`, `packages/ui`
- [x] TypeScript, ESLint, Prettier
- [x] Docker Compose (Postgres on 5433, Redis on 6380)
- [x] `config/kg.yaml` + `config/template.yaml`

## Phase 1 — Backend API ✅
- [x] Prisma schema (Number, Report, Vote, ReportCategory enum)
- [x] Database connection (Prisma 7 + pg adapter) + Redis (ioredis)
- [x] API routes:
  - `GET /numbers/:number` — lookup + score
  - `GET /numbers/:number/reports` — paginated
  - `POST /numbers/:number/reports` — submit report
  - `POST /reports/:id/vote` — vote on report
  - `GET /search?q=` — search by number
  - `GET /top-scammers?limit=` — top reported numbers
  - `GET /categories/:category?limit=` — numbers by category
  - `GET /stats` — site-wide counts with category breakdown
  - `GET /health` — DB + Redis ping
- [x] Scoring algorithm (`src/lib/score.ts`)
- [x] Rate limiting via `@fastify/rate-limit` + Redis
- [x] Tests (59 total, all passing)
  - `packages/phone-utils`: 27 tests
  - `apps/api` routes: 22 tests
  - `apps/api` lib: 10 tests

## Phase 2 — Web App ✅
- [x] Next.js 15 App Router setup
- [x] Tailwind CSS v4 + postcss
- [x] i18n with `next-intl` — Kyrgyz (`ky`) + Russian (`ru`)
- [x] Pages: `/` (homepage + stats), `/search`, `/number/[e164]` (lookup + reports)
- [x] Page: `/top-scammers` — dedicated API endpoint (`GET /top-scammers`), ordered by report count
- [x] Submit report form (Server Action, no CORS issues)
- [x] `sitemap.ts`, `robots.ts`
- [x] API fixes: snake_case contract, `{ data: [] }` search wrapper, stats shape
- [x] Manual test cases (`docs/web/testing/manual-test-cases.md`)
- [x] Pages: `/about`, `/faq`
- [x] Pages: `/categories` (index with counts), `/categories/[slug]` — dedicated `GET /categories/:category` API endpoint
- [x] SEO: structured data (JSON-LD) — `WebSite` + `SearchAction` on homepage, `WebPage` on number detail
- [x] Vote on reports UI — `ReportCard` has helpful/not helpful buttons, optimistic count, dedup via `authorHash`

## Phase 2.1 — Mobile View ✅
- [x] Navbar: hamburger menu on mobile (5 links overflow on small screens)
- [x] Homepage: `grid-cols-3` stat cards — too narrow at 375px, needs responsive sizing
- [x] List items (search, top-scammers, categories): add `min-w-0` + truncation so number + badge don't overflow
- [x] ReportCard: vote buttons cramped alongside content on narrow screens
- [x] Number detail header: long E.164 + score badge side-by-side can overflow

## Phase 3 — Telegram Bot ✅
- [x] grammy setup + webhook (long polling in dev, HTTP webhook server in prod via `BOT_WEBHOOK_URL`)
- [x] `/start`, `/check`, `/report` commands + bare number messages
- [x] Inline mode (`@bot 0700123456` → article result)

## Phase 4 — React Native App ⏭ Deferred
Too much work relative to value; web + bot already cover the use case.

## Phase 5 — Self-Hosting & Open Source ✅ (partial)
- [x] `SELF_HOSTING.md`
- [x] GitHub Actions CI (`.github/workflows/ci.yml` — lint, typecheck, test on push/PR)
- [x] Fixed 12 stale tests (score shape drift + snake_case API contract drift)
- [ ] API docs (Swagger) — deferred
- [ ] Contributing guide — deferred

## Phase 6 — Launch ⬜

**Target: $5/mo DigitalOcean droplet (1 vCPU, 1 GB RAM). All services on one machine via Docker Compose + Caddy.**

### 6.1 — Infrastructure prep ✅
- [x] `apps/web/Dockerfile` — standalone Next.js build (node:25-alpine, multi-stage)
- [x] `apps/bot/Dockerfile` — production bot (webhook mode, pnpm deploy)
- [x] `docker-compose.yml` (prod) — all services with GHCR images + Caddy; postgres/redis bound to 127.0.0.1
- [x] `docker-compose.dev.yml` — local dev (postgres:5433, redis:6380, api only)
- [x] `Caddyfile` — `{$DOMAIN}` → web, `api.{$DOMAIN}` → api, `/bot` → bot; auto HTTPS via Let's Encrypt
- [x] `.github/workflows/publish.yml` — builds api/web/bot images and pushes to GHCR on merge to main
- [x] `.env.example` — production env var template
- [x] `apps/web/next.config.ts` — added `output: standalone` + `outputFileTracingRoot`

### 6.2 — Server setup ⬜
- [ ] Provision droplet, point DNS
- [ ] Install Docker + Docker Compose on droplet
- [ ] Clone repo, create `.env` files
- [ ] `docker compose pull && docker compose up -d`
- [ ] `docker compose exec api npx prisma migrate deploy`

### 6.3 — Bot & content ⬜
- [ ] Register `@BelgisizNomurBot` in BotFather, enable inline mode (`/setinline`)
- [ ] Set `BOT_WEBHOOK_URL=https://domain.com/bot` — bot registers webhook on startup
- [ ] Seed known scam numbers
- [ ] Post in Kyrgyz tech communities / Telegram channels
