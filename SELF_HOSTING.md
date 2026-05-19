# Self-Hosting Guide

This guide explains how to run your own instance of Belgisiz Nomur for a different country or region.

## Architecture

| Component | What it does |
|---|---|
| **API** | Fastify REST API, business logic, scoring |
| **Web** | Next.js frontend (SSR, i18n) |
| **Bot** | Telegram bot (lookup + reports) |
| **PostgreSQL** | Primary database |
| **Redis** | Rate limiting, caching |

The `docker-compose.yml` at the repo root starts PostgreSQL, Redis, and the API. The web app and bot are run separately (Node.js processes or your preferred PaaS).

---

## Prerequisites

- Docker + Docker Compose v2
- Node.js 20+ and pnpm 11+ (for web and bot)
- A domain name (optional but recommended)
- A Telegram bot token from [@BotFather](https://t.me/BotFather) (for the bot)

---

## 1. Clone the repository

```bash
git clone https://github.com/your-org/belgisiz-nomur.git
cd belgisiz-nomur
pnpm install
```

---

## 2. Configure for your country

Copy the template config and fill it in:

```bash
cp config/template.yaml config/<your_country_code>.yaml
```

Edit the file — for example, `config/kz.yaml` for Kazakhstan:

```yaml
name: Belgisiz Nomer KZ
country_code: "7"
languages: [kk, ru]
default_language: kk
phone_formats:
  mobile: "+7 7XX XXX XX XX"
```

---

## 3. Set up environment variables

### API — `apps/api/.env`

```env
DATABASE_URL=postgresql://belgisiz:belgisiz@localhost:5433/belgisiz_nomur
REDIS_URL=redis://localhost:6380
CONFIG_PATH=./config/<your_country_code>.yaml
```

### Web — `apps/web/.env.local`

```env
# Server-side (SSR) — internal URL if API is on the same host
API_URL=http://localhost:3001
# Client-side — public URL your visitors can reach
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### Bot — `apps/bot/.env`

```env
TELEGRAM_BOT_TOKEN=your_token_here
API_URL=http://localhost:3001
SITE_URL=https://yourdomain.com
# For webhook mode (production):
# BOT_WEBHOOK_URL=https://yourdomain.com/bot
# BOT_PORT=3002
```

---

## 4. Start the database and API

```bash
docker compose up -d
```

This starts PostgreSQL (port 5433), Redis (port 6380), and the API (port 3001).

---

## 5. Run database migrations

On first run (and after updates), apply migrations from the host:

```bash
pnpm --filter @belgisiz-nomur/api exec prisma migrate deploy
```

---

## 6. Start the web app

```bash
pnpm --filter @belgisiz-nomur/web build
pnpm --filter @belgisiz-nomur/web start
```

The web app runs on port 3000 by default. Put it behind a reverse proxy (nginx, Caddy) for HTTPS.

---

## 7. Start the Telegram bot

```bash
pnpm --filter @belgisiz-nomur/bot dev    # long polling, for testing
```

For production, set `BOT_WEBHOOK_URL` in `.env` and run behind an HTTP server instead:

```bash
pnpm --filter @belgisiz-nomur/bot start
```

In BotFather, enable inline mode with `/setinline` for the `@bot query` feature to work.

---

## 8. (Optional) Seed known scam numbers

If you have a list of known scam numbers, submit them via the API:

```bash
curl -X POST http://localhost:3001/numbers/+7700123456/reports \
  -H 'Content-Type: application/json' \
  -d '{"category":"scam","comment":"Known scam number"}'
```

---

## Updating

```bash
git pull
pnpm install
pnpm --filter @belgisiz-nomur/api exec prisma migrate deploy
docker compose up -d --build
pnpm --filter @belgisiz-nomur/web build && pnpm --filter @belgisiz-nomur/web start
```

---

## Environment variable reference

| Variable | Component | Required | Description |
|---|---|---|---|
| `DATABASE_URL` | API | ✅ | PostgreSQL connection string |
| `REDIS_URL` | API | ✅ | Redis connection string |
| `CONFIG_PATH` | API | ✅ | Path to country YAML config |
| `API_URL` | Web, Bot | ✅ | API base URL (server-side) |
| `NEXT_PUBLIC_API_URL` | Web | ✅ | API base URL (client-side) |
| `NEXT_PUBLIC_SITE_URL` | Web | — | Canonical site URL (for SEO) |
| `TELEGRAM_BOT_TOKEN` | Bot | ✅ | Token from @BotFather |
| `SITE_URL` | Bot | — | Site URL embedded in bot messages |
| `BOT_WEBHOOK_URL` | Bot | — | Full webhook URL (enables webhook mode) |
| `BOT_PORT` | Bot | — | Webhook HTTP server port (default: 3002) |
