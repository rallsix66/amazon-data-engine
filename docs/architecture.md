# Amazon Data Engine Phase 1 Architecture

## Approved goal

Build a reliable, recoverable Amazon product-data engine. The first supported flows are ASIN collection and, later, keyword discovery feeding the same product queue. The system owns its data model, parser, raw captures, task state, quality metrics, and storage contracts.

## Explicitly out of scope

No access-control evasion, CAPTCHA solving, login automation, 1688 sourcing, image matching, cost or profit calculations, SaaS features, mobile app, Kubernetes, Kafka, microservices, or polished dashboard belongs to Phase 1.

## Boundary and dependency direction

```text
CLI/API → Job manager → Task queue → Collector → Raw capture → Parser → Normalizer → PostgreSQL
                                            │
                                            └→ Failure classifier / metrics
```

`collectors` may depend on Crawlee and Playwright. `parser` must not depend on browser code or database code. Persistence accepts normalized objects and raw-capture references, never browser objects. The future SP-API adapter is an external input adapter and must normalize into the same owned model; it is not a Phase 1 crawling dependency.

## Modules and owned data

| Module | Responsibility | Owns |
|---|---|---|
| Job manager | Create, resume and report jobs | Job lifecycle |
| Task queue | Deduplication, retry, checkpoint and terminal state | Task status and attempt history |
| Collectors | Retrieve a permitted public page and classify access failures | Raw response capture reference |
| Parser | Extract page fields without guessing unavailable values | Parsed field candidates |
| Normalizer | Produce the stable Amazon product contract | Normalized product/snapshot payload |
| Persistence | Store raw references, products, snapshots and errors | PostgreSQL records |

## Data model

- `products`: relatively stable identity and descriptive data, keyed by `(asin, marketplace)`.
- `product_snapshots`: time-varying price, rating, availability and offer signals with capture time.
- `crawl_jobs`, `crawl_tasks`, `crawl_errors`: operational evidence for throughput, failure causes, resume and auditability.
- Raw HTML is immutable input evidence, stored separately from normalized output so parser changes can reprocess it.

## Failure contract

Network and timeout failures may retry with bounded exponential backoff. CAPTCHA, login, blocked, or unexpected access pages become `ACCESS_LIMITED` or an explicit terminal error; the collector must not attempt to bypass them. Parser failures must remain distinct from access and transport failures. A failed task must not stop the rest of its job.

## Verification minimum

Before claiming an MVP capability works: parser fixtures must pass, TypeScript must build, and a permitted test collection must produce a raw capture plus normalized JSON. Database-backed claims additionally require migration and a persisted product/snapshot check.

## Future proposals

Keyword discovery, PostgreSQL runtime wiring, job resume execution, full metrics reporting, and SP-API are approved Phase 1/next-step targets but are not verified current capabilities. Selection, sourcing, matching and profit engines are later proposals only.
