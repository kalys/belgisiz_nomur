# Belgisiz Nomur — Project Plan

Phone number reputation service for Kyrgyzstan (+996), open-source and self-hostable for other countries.

---

## Phase 0 — Foundation (Week 1–2)

**Monorepo setup**
- Turborepo + pnpm workspaces
- `apps/api`, `apps/web`, `apps/bot`, `apps/mobile`
- `packages/phone-utils`, `packages/ui`, `packages/config`
- ESLint, Prettier, TypeScript across all apps
- Docker Compose for local development (API + Postgres + Redis)

**Country config system**
```yaml
# config/kg.yaml
name: Belgisiz Nomur
country_code: "996"
languages: [ky]
default_language: ky
phone_formats:
  mobile: "+996 7XX XXX XXX"
  landline: "+996 3XX XX XX XX"
```

**`packages/phone-utils`**
- Normalize any input → E.164 format
- Detect carrier from prefix
- Validate by country rules
- Used by API, bot, and mobile

---

## Phase 1 — Backend API (Week 2–4)

**Tech:** Node.js + Fastify + PostgreSQL + Redis + Prisma

**Database schema:**
```
numbers         id, e164, country_code, carrier, created_at
reports         id, number_id, category, comment, author_hash, created_at, ip_hash
categories      scam | spam | telemarketer | debt_collector | legitimate | unknown
votes           id, report_id, helpful (bool), author_hash
```

**API endpoints:**
```
GET  /numbers/:number          → lookup + aggregated score
GET  /numbers/:number/reports  → paginated comments
POST /numbers/:number/reports  → submit report
POST /reports/:id/vote         → helpful/not helpful
GET  /search?q=...             → search by number or prefix
GET  /stats                    → site-wide stats
```

**Scoring algorithm:**
- Weighted by: vote count, recency, reporter reputation
- Confidence level (low/medium/high) based on report count thresholds

**Anti-abuse:**
- Rate limiting per IP (Redis)
- Hashed fingerprinting (no PII stored)
- Minimum report threshold before showing score publicly

---

## Phase 2 — Web App (Week 4–6)

**Tech:** Next.js 14 (App Router) + Tailwind CSS

**Pages:**
- `/` — search bar, recent reports, stats
- `/number/[e164]` — number detail, score, all comments, submit form
- `/top-scammers` — most reported numbers
- `/categories/[slug]` — browse by category
- `/about` + `/faq`

**SEO focus** (critical for organic growth):
- Each number gets a static-ish page with SSR
- Structured data (schema.org)
- Kyrgyz + Russian meta content
- Sitemap generation

**i18n:** `next-intl` with `ky` and `ru` locales

---

## Phase 3 — Telegram Bot (Week 6–7)

**Tech:** `grammy` library + webhooks

**Commands:**
```
/start              → welcome + instructions
/check +996700...   → lookup number
/report +996700...  → start report flow (guided)
```

**Inline mode:**
- Type `@belgisiz_nomer_bot 0700123456` in any chat
- Returns summary card inline

**Flow:**
```
User: 0700123456
Bot: 📞 +996 700 123 456
     ⚠️ Reported 14 times
     🏷 Mostly: Scam (71%)
     💬 "Банк деп чалышат" — 3 days ago
     [See full details] [Report this number]
```

---

## Phase 4 — React Native App (Week 7–10)

**Tech:** React Native + Expo + Expo Router

**Features:**
- Search screen
- Number detail screen (same data as web)
- Submit report
- Call log integration — detect recent calls and offer quick lookup
- Push notifications — "A number you searched was just reported as scam"
- Offline cache (last 50 searches)

**Shared:** `packages/ui` design tokens used by web + mobile

---

## Phase 5 — Self-Hosting & Open Source (Week 10–11)

**For other country operators:**
- `docker-compose.yml` — one command to run everything
- `SELF_HOSTING.md` — step-by-step guide
- `config/template.yaml` — copy and fill in your country
- Environment variable based config injection
- GitHub Actions CI (lint, test, build)

**Documentation:**
- API docs (auto-generated via Swagger)
- Contributing guide
- Architecture diagram

---

## Phase 6 — Launch (Week 12)

- Deploy API + Web on Railway or Fly.io
- Register Telegram bot (`@belgisiz_nomer_bot`)
- Submit to App Store + Google Play
- Seed with known scam numbers (publicly available KG scam lists)
- Post in Kyrgyz tech communities, Telegram channels

---

## Tech Stack Summary

| Layer | Choice |
|---|---|
| Monorepo | Turborepo + pnpm |
| Backend | Fastify + Prisma + PostgreSQL + Redis |
| Web | Next.js 14 + Tailwind + next-intl |
| Bot | grammy (Telegram) |
| Mobile | React Native + Expo |
| Infra | Railway / Fly.io |
| CI/CD | GitHub Actions |

---

## Deferred (post-launch)

- User accounts / login (start anonymous)
- Carrier API integration (if available in KG)
- AI-based scam pattern detection
- Other country instances

---

## Status

- [ ] Phase 0 — Foundation
- [ ] Phase 1 — Backend API
- [ ] Phase 2 — Web App
- [ ] Phase 3 — Telegram Bot
- [ ] Phase 4 — React Native App
- [ ] Phase 5 — Self-Hosting & Open Source
- [ ] Phase 6 — Launch
