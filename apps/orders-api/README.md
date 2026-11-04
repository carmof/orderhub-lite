# @orderhub/orders-api

Fastify service for orders. This README is a map of how the project is organized, so you know where
new code belongs.

## Project structure (target layout)

```text
src/
├── server.ts              # entrypoint: load config, build app, listen, graceful shutdown
├── app.ts                 # buildApp(): creates Fastify, registers plugins and modules
├── config.ts
├── plugins/               # cross-cutting, wrapped with fastify-plugin (fp)
│   ├── error-handler.ts
│   ├── db.ts              # decorates fastify.db
│   └── ...
└── modules/
    ├── orders/
    │   ├── orders.routes.ts      # FastifyPluginAsyncZod: only route declarations
    │   ├── orders.handlers.ts    # (optional) request → service call → reply
    │   ├── orders.service.ts     # business logic, no Fastify types
    │   ├── orders.repository.ts  # data access
    │   ├── orders.schemas.ts     # zod schemas (or import from @orderhub/contracts)
    │   └── orders.service.test.ts
    ├── customers/
    └── health/
        └── health.routes.ts
```

## Conventions

- **One plugin per module.** Each folder in `modules/` exposes a route plugin, registered in
  `app.ts` with a prefix, for example `app.register(ordersRoutes, { prefix: '/orders' })`.
- **`plugins/` vs `modules/`.** Shared infrastructure (database, error handler, auth) lives in
  `plugins/` and is wrapped with `fastify-plugin` so its decorators are visible app-wide. Feature
  modules are not wrapped, so they stay encapsulated.
- **Keep services free of Fastify.** Handlers validate input, call the service and shape the
  response. Services take plain arguments, which keeps business rules easy to unit test.
- **Shared schemas go in `@orderhub/contracts`.** Schemas used by other services or clients belong
  there. Schemas used only by one module stay in that module.
