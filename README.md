# Белгисиз Номер

Phone number reputation service for Kyrgyzstan. Look up whether a number is a scammer, spammer, or telemarketer — and report ones that are.

**Live at:** bn.osmonov.com · **Telegram bot:** @belgisiz_nomer_bot

---

## Features

- Search any KG number (`0700 123 456`, `+996 700 123 456`, or any local format)
- Community reports with categories: scam, spam, telemarketer, debt collector, legitimate, unknown
- Score + confidence level based on report volume and recency
- Helpful/not helpful voting on reports
- Kyrgyz and Russian UI
- Telegram bot: `/check`, `/report`, inline mode (`@belgisiz_nomer_bot 0700123456`)
- Self-hostable for any country (see [SELF_HOSTING.md](./SELF_HOSTING.md))

## Stack

| Layer | Tech |
|---|---|
| Monorepo | Turborepo + pnpm workspaces |
| API | Fastify 5 + Prisma 7 + PostgreSQL + Redis |
| Web | Next.js 15 (App Router, SSR, i18n) |
| Bot | grammy (Telegram) |
| Infra | Docker Compose + Caddy |
| CI/CD | GitHub Actions |

## Project layout

```
apps/
  api/      Fastify REST API
  web/      Next.js frontend
  bot/      Telegram bot
packages/
  phone-utils/  Normalize + validate KG numbers
  ui/           Shared design tokens
  config/       Country YAML config loader
config/
  kg.yaml       Kyrgyzstan config
  template.yaml Blank template for other countries
```

## Local development

**Prerequisites:** Node.js 20+, pnpm 11+, Docker

```bash
git clone https://github.com/your-org/belgisiz-nomur.git
cd belgisiz-nomur
pnpm install

# Start Postgres + Redis
docker compose -f docker-compose.dev.yml up -d postgres redis

# Run migrations
pnpm --filter @belgisiz-nomur/api exec prisma migrate deploy

# Start everything
pnpm --filter @belgisiz-nomur/api dev   # :3001
pnpm --filter @belgisiz-nomur/web dev   # :3000
pnpm --filter @belgisiz-nomur/bot dev   # long polling (needs TELEGRAM_BOT_TOKEN in apps/bot/.env)
```

Copy `apps/api/.env.example` → `apps/api/.env` and fill in the values. The defaults work with the Docker Compose ports out of the box.

## Running tests

```bash
pnpm turbo test
```

64 tests, no external services required (DB and Redis are mocked in API tests).

## Self-hosting

See [SELF_HOSTING.md](./SELF_HOSTING.md) for deploying your own instance — including instructions for adapting the config to a different country.

## API

The REST API runs on port 3001. Key endpoints:

```
GET  /numbers/:number          Lookup + score
GET  /numbers/:number/reports  Paginated reports
POST /numbers/:number/reports  Submit a report
POST /reports/:id/vote         Vote on a report
GET  /search?q=                Search by number or prefix
GET  /top-scammers             Most reported numbers
GET  /categories/:category     Numbers by category
GET  /stats                    Site-wide counts
```

All responses use snake_case. Scores include `report_count`, `spam_ratio`, and `confidence` (`low` / `medium` / `high`).

## Contributing

Issues and PRs are welcome. The CI pipeline runs lint, typecheck, and tests on every PR — make sure those pass before requesting a review.

## License

MIT
