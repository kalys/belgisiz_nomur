# Belgisiz Nomur — Context & Knowledge

## Stack
- **Runtime:** Node.js 25 (odd release — Prisma warns but works)
- **Monorepo:** Turborepo + pnpm 11 workspaces
- **API:** Fastify 5 + Prisma 7 + PostgreSQL + Redis (ioredis)
- **Web:** Next.js 15 (App Router)
- **Bot:** grammy
- **Mobile:** React Native + Expo
- **Tests:** Vitest

## Infrastructure (local dev)
- PostgreSQL via Docker on port **5433** (system Postgres is on 5432)
- Redis via Docker on port **6380** (system Redis is on 6379)
- API runs on port **3001**
- Docker Compose starts only Postgres + Redis (API runs locally with `tsx`)

## Prisma 7 — Important Changes
Prisma 7 broke from earlier conventions in two ways:

1. **No `url` in `schema.prisma`** — connection URL moved to `prisma.config.ts` (for migrations) and passed via driver adapter to `PrismaClient` at runtime
2. **Driver adapter required** — `new PrismaClient()` with no args throws. Must use `@prisma/adapter-pg`:
   ```ts
   const adapter = new PrismaPg({ connectionString: url })
   new PrismaClient({ adapter })
   ```
3. **`driverAdapters` preview feature** must be enabled in `schema.prisma`

## pnpm Workspace — Gotchas
- Package `exports` must match actual tsup output: `import → dist/index.mjs`, `require → dist/index.js` (not `.cjs`)
- `pnpm deploy --legacy` flag required (pnpm 10+ changed deploy behavior)
- `CI=true` env var needed in Dockerfile builder stage (pnpm asks for TTY confirmation otherwise)
- Workspace deps added manually in `package.json` as `"workspace:*"` (pnpm CLI can't resolve unpublished packages by name)

## API Architecture
- `src/app.ts` — `buildApp(opts)` factory, accepts `{ rateLimit: boolean }`
- `src/index.ts` — calls `buildApp()` then `app.listen()`
- `src/db.ts` — Prisma singleton via `globalThis`
- `src/redis.ts` — ioredis client with `lazyConnect: true`
- `src/lib/score.ts` — pure scoring function, no DB calls
- `src/lib/fingerprint.ts` — hashes IP + user-agent (no PII stored)

## Rate Limiting
- Global: **60 req/min** per IP (all GET routes)
- `POST /numbers/:number/reports`: **5 req/10 min**
- `POST /reports/:id/vote`: **20 req/10 min**
- Backed by Redis — works across multiple API instances

## Phone Number Normalization
Handles: `0700123456`, `700123456`, `996700123456`, `+996700123456`
All normalize to E.164: `+996XXXXXXXXX`
Carrier detection lives in `packages/phone-utils/src/carriers.ts` as a static prefix map — not in country config.

## Search
Search strips non-digits AND leading zeros before matching against E.164 strings.
`0700` → strip → `700` → matches `+996700123456` ✓

## Testing Approach
- **`packages/phone-utils`**: real unit tests, no mocks
- **`apps/api` routes**: Fastify `inject` + `vi.mock('../db.js')` + `vi.mock('../redis.js')`
- **`apps/api` lib**: pure unit tests, no mocks
- Rate limiting disabled in tests via `buildApp({ rateLimit: false })`

## Web App (Phase 2)
- **Framework:** Next.js 15 App Router, `[locale]` dynamic segment for i18n
- **i18n:** next-intl v3.26.5 — locales: `ky` (Kyrgyz, default) + `ru` (Russian)
  - `hasLocale` is NOT exported in v3.26.5 — use `(routing.locales as readonly string[]).includes(locale)`
  - Message files live at `apps/web/messages/{ky,ru}.json` (not monorepo root)
- **Styling:** Tailwind CSS v4 — entry is `@import "tailwindcss"` in globals.css, plugin is `@tailwindcss/postcss`
- **Forms:** Use Next.js Server Actions for cross-origin POSTs to the API (avoids CORS entirely)
- **URL encoding:** Strip leading `+` before `encodeURIComponent` — Fastify cannot route `%2B996...`
  ```ts
  encodeURIComponent(number.replace(/^\+/, ''))
  ```

## API Response Contract (snake_case)
All API routes return snake_case fields. Key shapes:
- `GET /numbers/:number` → `{ e164, carrier, country_code, score, created_at }`
- `GET /numbers/:number/reports` → `{ data, total, page, limit }` with `vote_count`, `helpful_count`
- `GET /search` → `{ data: [{ e164, carrier, country_code, score, created_at }] }`
- `GET /top-scammers` → same `{ data: [...] }` shape, ordered by report count desc
- `GET /categories/:category` → same `{ data: [...] }` shape, filtered + ordered by report count desc
- `GET /stats` → `{ total_numbers, total_reports, total_votes, category_breakdown: Partial<Record<Category, number>> }`
- `score` shape: `{ score: number, confidence: 'low'|'medium'|'high', report_count, spam_ratio }`

## Bot (Phase 3)
- **Dev:** `pnpm --filter @belgisiz-nomur/bot dev` — requires `apps/bot/.env` with `TELEGRAM_BOT_TOKEN`
- **Env loading:** `tsx watch --env-file=.env src/index.ts` (Node 20+ `--env-file` flag, after `watch` subcommand)
- **Report flow:** in-memory `Map<chatId, session>` — lost on restart, acceptable for now
- **Webhook mode:** set `BOT_WEBHOOK_URL` in `.env`; bot starts an HTTP server on `BOT_PORT` (default 3002)
- **Inline mode:** must be enabled in BotFather (`/setinline`)

## Listing Endpoints Pattern (top-scammers, categories)
Search endpoint cannot serve filtered/sorted lists — it only does substring match on e164.
For any "list numbers by X" feature, add a dedicated route in the API.
All listing routes share the same response shape: `{ data: PhoneNumber[] }` (same as SearchResult in web's api.ts).

## Docker — Prisma in Multi-Stage Builds
`pnpm deploy --prod --legacy` creates a fresh `node_modules` that loses the generated Prisma client.
Fix: run `prisma generate` again inside the deploy directory after `pnpm deploy`:
```dockerfile
RUN pnpm --filter @belgisiz-nomur/api deploy --prod --legacy /app/deploy
COPY apps/api/prisma /app/deploy/prisma
COPY apps/api/prisma.config.ts /app/deploy/prisma.config.ts
RUN cd /app/deploy && node_modules/.bin/prisma generate
```
Note: `.bin/prisma` is a shell script — do NOT prefix with `node`.

## Local Dev
Keep postgres + redis in Docker, run API/web/bot directly for hot-reload:
```bash
pnpm --filter @belgisiz-nomur/api dev   # tsx watch, port 3001
pnpm --filter @belgisiz-nomur/web dev   # Next.js, port 3000
pnpm --filter @belgisiz-nomur/bot dev   # tsx watch + long polling
```
API `.env` already points to Docker ports (5433, 6380) so it just works.
Web `.env.local` points to `http://localhost:3001` for both server and client API calls.
Bot `apps/bot/.env` needs `TELEGRAM_BOT_TOKEN` and `API_URL=http://localhost:3001`.
