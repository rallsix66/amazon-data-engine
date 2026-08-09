# Amazon Data Engine rules

Read `docs/architecture.md` and `docs/status.md` before changing this project. Keep the modular-monolith dependency direction intact: collector → raw capture → parser → normalizer → persistence. Do not add access-control evasion, CAPTCHA solving, login automation, 1688 matching, profit logic, microservices, or unapproved external-service dependencies. Never invent unavailable Amazon fields; persist `NULL` and an explicit failure classification instead.
