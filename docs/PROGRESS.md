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

## Phase 2 — Web App 🔄
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
- [ ] SEO: structured data (JSON-LD)
- [ ] Vote on reports UI

## Phase 3 — Telegram Bot ⬜
- [ ] grammy setup + webhook
- [ ] `/start`, `/check`, `/report` commands
- [ ] Inline mode

## Phase 4 — React Native App ⬜
- [ ] Expo + Expo Router
- [ ] Search, number detail, submit report screens
- [ ] Call log integration
- [ ] Push notifications
- [ ] Offline cache

## Phase 5 — Self-Hosting & Open Source ⬜
- [ ] `SELF_HOSTING.md`
- [ ] GitHub Actions CI
- [ ] API docs (Swagger)
- [ ] Contributing guide

## Phase 6 — Launch ⬜
- [ ] Deploy to Railway / Fly.io
- [ ] Register Telegram bot
- [ ] App Store + Google Play submission
- [ ] Seed known scam numbers
