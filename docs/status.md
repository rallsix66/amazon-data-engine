# Project Status

## Current state

| Item | State | Evidence | Next action |
|---|---|---|---|
| Phase 1 scope and architecture boundary | verified | Approved product definition and `docs/architecture.md` | Preserve boundaries during implementation |
| TypeScript project scaffold | implemented | `package.json`, TypeScript configuration and source layout exist | Install dependencies and build |
| Product parser fixture test | implemented | `tests/product-parser.test.ts` and fixture exist | Run test suite |
| Crawlee/Playwright collection entry point | implemented | `src/collectors/amazon-product.ts` exists | Run only against permitted pages and validate failures |
| PostgreSQL logical schema | implemented | `db/001_initial.sql` exists | Start database and apply migration |
| Raw capture persistence | implemented | `src/services/raw-capture.ts` writes immutable HTML captures before parsing | Verify with a permitted collection |
| Jobs, durable queue, resume and metrics runtime | pending | Schema and state model exist; no runtime repository exists | Implement after MVP-1 validation |
| Keyword discovery | approved | Product definition | Implement after batch ASIN loop is verified |
| SP-API adapter | proposal | Product definition | Do not implement in initial MVP |

## Current risk

The existing collector/parser has not been built or tested and does not yet persist raw captures. It is not ready for production collection or scale claims.
