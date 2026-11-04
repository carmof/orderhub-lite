# 0000. Service structure

- Status: Accepted
- Date: 2026-11-04

## Context

`orders-api` starts with one feature (orders) but the plan already tells us it will grow:
webhooks with idempotency, an outbox relay and a Kafka consumer (separate processes),
a GraphQL API next to REST, and probably more business modules (returns, payments).
Without an agreed layout, each new file lands "wherever looks right", business rules leak
into routes and repositories, and the code becomes hard to navigate for people and for AI agents.

## Decision

Every service in this monorepo uses this layout:

    src/
      entrypoints/     one file per process (api.ts, later relay.ts, consumer.ts)
      modules/<name>/
        index.ts       the module's public API
        domain/        pure business rules
        application/   use cases + ports (interfaces)
        infra/         adapters: Prisma repositories, HTTP clients
        http/          Fastify routes
        graphql/       (later) GraphQL types for this module
      shared/          generic code that knows no module (errors, problem+json, db client)
      composition.ts   composition root: creates Prisma, repositories, clients, use cases
      app.ts           builds Fastify only; receives ready dependencies
      config.ts        env validated with zod
    test/              integration tests, fakes/, factories/

Dependency rules:

1. `domain` imports nothing outside itself except `@orderhub/contracts`.
2. `application` imports only `domain` and its own ports.
3. `http` (and `graphql`) call `application`, never `infra`.
4. A module uses another module only through its `index.ts`.
5. `shared/` never imports from `modules/`.

Only `composition.ts` instantiates infrastructure.

## Consequences

- Positive: each new feature has an obvious home; the domain and use cases are testable
  without a database or Fastify; adding a process (relay, consumer) reuses the composition;
  agents and reviewers can follow one documented map.
- Negative: more files and folders at the start than a single-folder API; some boilerplate
  (ports, index.ts) for a service that today has one module.
- Enforcement: the rules become lint on Week 1 Day 6 (ESLint per layer + dependency-cruiser).
