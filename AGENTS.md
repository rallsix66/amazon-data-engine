# Amazon Data Engine — repository instructions

This file is the root instruction map for coding agents working in this repository. Keep it concise and use the linked project documents as the source of truth for detailed architecture and current capability status.

## Scope and precedence

- This `AGENTS.md` applies to the entire repository tree.
- If a deeper directory later contains its own `AGENTS.md` or `AGENTS.override.md`, follow the more specific instructions for files in that directory.
- Direct system, developer, and user instructions take precedence over this file.
- Do not ignore an applicable instruction because the requested change appears small or documentation-only.

## Read before changing code

Before making a non-trivial change:

1. Read `docs/architecture.md` for approved scope, module boundaries, data ownership, failure semantics, and verification requirements.
2. Read `docs/status.md` to distinguish verified, implemented-but-unverified, pending, and proposal capabilities.
3. Read the relevant implementation, tests, schema, and `README.md` sections before editing them.
4. Inspect the current code instead of assuming a feature described in planning documents already works.
5. If code and documentation conflict, treat the conflict as something to resolve or report; do not silently choose the more convenient version.

## Project mission

Build a reliable, recoverable Amazon product-data engine that owns its raw evidence, parsing, normalization, task state, quality/failure signals, and PostgreSQL storage contracts.

The current architecture is a modular monolith. Preserve this dependency direction:

```text
CLI/API → Job manager → Task queue → Collector → Raw capture → Parser → Normalizer → PostgreSQL
                                            │
                                            └→ Failure classifier / metrics
```

Current Phase 1 work centers on ASIN product collection. Keyword discovery may later feed the same product queue. The future SP-API integration is an external input adapter that must normalize into the same owned model; it is not a reason to bypass existing domain contracts.

## Architecture invariants

- Keep browser/network concerns inside `src/collectors`.
- `src/parser` must not depend on Playwright, Crawlee, browser objects, or database code.
- Parsers extract field candidates from captured input; they do not perform persistence or collection.
- Raw capture must occur before parsing/normalization whenever a real page is collected.
- Raw HTML is immutable evidence. Parser improvements should be able to reprocess stored captures without revisiting Amazon.
- Normalization produces the stable owned product/snapshot contract.
- Persistence accepts normalized values and raw-capture references, never Playwright/Crawlee page or browser objects.
- Keep stable identity/descriptive data separate from time-varying snapshot data.
- Do not introduce microservices, Kafka, Kubernetes, or new architectural layers without an explicitly approved architecture change.

## Repository map

- `src/cli.ts` — command-line entry point.
- `src/collectors/` — permitted public-page retrieval and access/transport failure classification.
- `src/parser/` — replaceable Amazon HTML parsers.
- `src/domain/` — owned schemas, normalized contracts, and task state definitions.
- `src/services/` — pipeline services such as immutable raw capture handling.
- `db/` — PostgreSQL schema/migrations for products, snapshots, jobs, tasks, and errors.
- `tests/` — fixtures and automated verification, especially parser behavior.
- `docs/architecture.md` — architectural source of truth.
- `docs/status.md` — capability/evidence source of truth.
- `README.md` — user-facing scope, setup, commands, and repository orientation.

## Data correctness rules

- Never invent an Amazon field that was not present or could not be reliably extracted.
- Use `NULL`/optional values for unavailable fields and preserve an explicit failure or quality classification where applicable.
- Do not convert an access failure into a parse failure or vice versa.
- Preserve `(asin, marketplace)` identity semantics for products unless the architecture is deliberately revised.
- Store changing observations such as price, rating, availability, and offer signals as snapshots rather than overwriting stable identity data.
- Preserve raw evidence needed to audit or re-run parsing.
- Prefer deterministic parsing and normalization over heuristic guessing.
- When adding or changing a field, trace it end-to-end: source evidence → parser candidate → normalized contract → persistence/schema → tests.

## Collection and access rules

- Collect only permitted public pages using the approved Crawlee/Playwright approach.
- Do not add CAPTCHA solving, stealth/access-control evasion, credential stuffing, login automation, proxy rotation intended to defeat blocking, or similar bypass mechanisms.
- CAPTCHA, login, blocked, and unexpected access pages must become `ACCESS_LIMITED` or another explicit terminal classification; do not attempt to bypass them.
- Network/time-out failures may retry only with bounded behavior consistent with the architecture; access restrictions are not retry loops for evasion.
- A failed task must not silently corrupt normalized data or stop unrelated tasks in the same job.
- Before production-scale collection, preserve the project requirement to review applicable Amazon terms, robots guidance, and rate limits.

## Explicitly out of scope unless the user approves a scope change

Do not implement or smuggle in:

- access-control evasion or CAPTCHA solving;
- automated Amazon login flows;
- 1688 sourcing or matching;
- image matching for sourcing;
- cost, margin, or profit calculations;
- product-selection/ranking engines unrelated to Phase 1 collection quality;
- SaaS/account/billing features;
- mobile applications;
- polished dashboards;
- microservice infrastructure;
- unapproved third-party/external-service dependencies.

If a request would cross one of these boundaries, explain the boundary and ask for an explicit scope/architecture decision rather than implementing it indirectly.

## TypeScript and implementation conventions

- Keep the project compatible with the existing strict TypeScript configuration (`ES2022`, `NodeNext`, `strict: true`).
- Follow the existing ESM/module conventions.
- Prefer small modules with clear ownership over cross-layer utility files that blur boundaries.
- Prefer existing dependencies (`crawlee`, `playwright`, `pg`, `zod`) when they already solve the problem.
- Do not add a dependency merely for convenience; justify new dependencies against repository scope and architecture.
- Validate external/untrusted data at boundaries; use the existing domain/Zod contracts where appropriate.
- Avoid broad `any`, unchecked casts, swallowed errors, and catch blocks that erase the failure classification.
- Keep failure handling explicit and observable.
- Do not include secrets, credentials, cookies, tokens, or real `.env` values in source, tests, fixtures, logs, or documentation.

## Database rules

- Preserve the separation between stable `products`, time-varying `product_snapshots`, operational job/task/error state, and raw-capture references.
- Schema changes must stay synchronized with domain contracts and persistence code.
- Prefer forward migrations for established schema changes; do not make destructive schema edits casually.
- Database-backed capability claims require evidence that the migration applies and a product/snapshot can actually be persisted.

## Tests and verification

After repository changes, make a best effort to run the applicable checks after all edits are complete. At minimum, when dependencies/environment permit:

```bash
npm run test
npm run build
```

For collector or end-to-end MVP claims, also verify on a permitted test page that the flow produces:

1. a raw capture;
2. parsed/normalized output;
3. the expected failure classification when collection cannot proceed.

For database-backed claims, additionally apply the relevant migration and verify persisted product/snapshot records.

If a check cannot run because dependencies, browser binaries, PostgreSQL, network access, credentials, or another prerequisite are unavailable, do not report it as passed. State exactly what was not run and why.

## Testing expectations for changes

- Parser changes require fixture coverage for the changed behavior.
- Failure-classification changes require tests that keep access, transport, and parser failures distinct.
- Domain/schema changes require tests or verification that exercise the new contract.
- Bug fixes should include a regression test when practical.
- Do not weaken or delete a test only to make a change pass unless the expected behavior itself was intentionally changed.

## Documentation and status discipline

Treat repository documentation as maintained project state, not historical commentary.

- Update `docs/architecture.md` when approved boundaries, data ownership, or core contracts change.
- Update `docs/status.md` when a capability moves between proposal, pending, implemented, and verified states.
- Update `README.md` when setup commands, supported flows, or user-facing scope changes.
- Do not label a feature “verified”, “working”, “production-ready”, or equivalent without the evidence required by `docs/architecture.md`.
- Do not turn planned/future items into current capabilities simply because interfaces or schemas exist.

## Change discipline

- Make the smallest coherent change that satisfies the task.
- Preserve unrelated user work and avoid opportunistic refactors.
- Do not rewrite working architecture merely to introduce a preferred pattern.
- Do not modify generated/runtime artifacts unless they are intentionally tracked and required.
- When a change affects multiple layers, keep the contract synchronized across all affected layers in the same task.
- Stop and report a material ambiguity when proceeding would require inventing business rules, unavailable Amazon data, or an unapproved architecture decision.

## Definition of done

A task is not complete until the relevant items below are true:

- requested behavior is implemented in the correct module(s);
- architecture and scope boundaries remain intact or an approved change is documented;
- affected tests exist and pass when runnable;
- TypeScript builds when runnable;
- database verification is performed for database-backed claims when runnable;
- documentation/status is updated if the repository's actual capability changed;
- no unavailable Amazon values were fabricated;
- no access-control bypass was introduced;
- the final report distinguishes verified results from unverified assumptions or blocked checks.

## Agent completion report

When finishing a coding task, report concisely:

- what changed and why;
- the important files changed;
- tests/build/verification actually run and their results;
- anything not run and the exact blocker;
- remaining known limitations or follow-up work, if any.

Do not claim success based only on code inspection when the repository defines a runnable verification step.
