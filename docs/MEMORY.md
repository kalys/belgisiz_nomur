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
