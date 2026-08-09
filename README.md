# Amazon Data Engine — Phase 1 MVP

The first phase of the Product Sourcing Intelligence Engine: a modular monolith that collects public Amazon product data, retains raw captures, normalizes stable product data and time-varying snapshots, and records recoverable task state.

## Scope

- MVP-1: one ASIN → compliant browser collection → raw capture → parser → normalized JSON.
- MVP-2 foundation: explicit task states, retry/backoff policy, deduplication keys, metrics and failure classification.
- MVP-3/4 interfaces: keyword discovery feeds the product queue; PostgreSQL schema supports products, snapshots, jobs, tasks, and errors.

It deliberately does not implement CAPTCHA solving, login automation, access-control evasion, 1688 matching, costing, profitability, SaaS features, or a dashboard. Access-limited pages become `ACCESS_LIMITED` tasks.

## Architecture

`Job manager → task queue → browser collector → raw capture → parser → normalizer → PostgreSQL`

Raw HTML is retained separately so parser upgrades can reprocess captures without revisiting a page. `products` stores stable identity data; `product_snapshots` stores data that changes over time.

## Start

1. Copy `.env.example` to `.env` and set `DATABASE_URL` when using PostgreSQL.
2. `npm install`
3. `npx playwright install chromium`
4. `npm run test`
5. `npm run dev -- product B0EXAMPLE01 US`

The initial collector is intentionally conservative: it uses standard Playwright through Crawlee and records blocked, CAPTCHA, login, unexpected-page, parse, and transport failures separately.

## Layout

- `src/domain` — schemas and task state machine
- `src/parser` — replaceable Amazon page parsers
- `src/collectors` — Crawlee/Playwright execution layer
- `src/services` — raw-to-normalized pipeline and metrics
- `db` — PostgreSQL schema
- `tests` — parser fixture tests

The official SP-API is a future adapter boundary, not a Phase 1 dependency. Before production use, review Amazon’s applicable terms, robots guidance, and rate limits.
