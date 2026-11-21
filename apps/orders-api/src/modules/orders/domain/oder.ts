import { randomUUID } from 'node:crypto';
import type { OrderStatus } from '@orderhub/contracts';
import { orderTotalCents } from './order-total.js';

/**
 * orders/domain/order.ts: the Order AGGREGATE (DDD)
 *
 * WHAT IT IS
 * The heart of the orders module: what an Order is and which rules it must
 * always obey. In DDD terms, Order is an aggregate: a cluster of objects
 * (the Order + its OrderItems) treated as ONE unit for changes, with Order as
 * the aggregate root. Items have no life outside their order.
 *
 * WHAT LIVES HERE
 * - The types: Order, OrderItem, and the domain inputs (PlaceOrderInput).
 * - Factories that create a VALID order (placeOrder): build the object in
 *   memory, generate the id, set initial status/version. They do NOT save it.
 * - Behaviors that change an order (transition): return a NEW Order
 *   (immutable, readonly), never mutate the old one.
 * - Invariants: business rules that must hold no matter who calls
 *   (HTTP, webhook, queue, test). E.g. at least one item, valid status
 *   transitions, total fits in a safe integer.
 * - Domain errors thrown when a rule is broken.
 *
 * WHAT DOES NOT LIVE HERE
 * - Persistence: no Prisma, no SQL, no repository calls. Saving is the
 *   application layer's job (use case -> repository port -> infra adapter).
 * - HTTP: no Fastify, no status codes, no request/response, no DTOs.
 *   Mapping Order -> OrderDto belongs in application/.
 * - Input shape/format validation (missing field, wrong type): that is the
 *   boundary's job (Fastify schema). Here, only BUSINESS rules.
 * - Libraries for validation/framework (Zod, etc.), env/config, logging,
 *   clocks or random sources used implicitly: time and id come in as
 *   parameters (with defaults) so tests stay deterministic.
 * - Orchestration across aggregates or external services: that is a use case.
 *
 * RULES OF THUMB
 * - Pure functions: same input -> same output, no I/O. Unit tests need no DB.
 * - Only the root is changed from outside; never edit an OrderItem directly.
 * - One aggregate = one transaction = one `version` (optimistic locking).
 * - Dependencies point INWARD: application and infra import domain,
 *   domain imports nothing from them.
 *
 * Further reading: Vaughn Vernon, "Effective Aggregate Design";
 * Eric Evans, "Domain-Driven Design", chapter "Aggregates".
 */

export type OrderItem = {
  sku: string;
  quantity: number;
  unitPriceCents: number;
};

export type Order = {
  readonly id: string;
  readonly tenantId: string;
  readonly channel: string;
  readonly externalId: string;
  readonly status: OrderStatus;
  readonly items: readonly OrderItem[];
  readonly totalCents: number;
  readonly currency: string;
  readonly version: number;
  readonly createdAt: Date;
};

export type PlaceOrderInput = {
  tenantId: string;
  channel: string;
  externalId: string;
  currency: string;
  items: OrderItem[];
};

export const placeOrder = (
  input: PlaceOrderInput,
  id: string = randomUUID(),
  now: Date = new Date(),
): Order => {
  if (input.items.length === 0) {
    throw new Error(`Order items can't be zero.`);
  }

  const uniqueSkus = new Set<string>();

  const orderItemsValidation = input.items.reduce<{ errors: string[] }>(
    (acc, item, index) => {
      if (item.quantity <= 0) {
        acc.errors.push(`[${index.toString()}] Quantity <= 0`);
      }
      if (item.unitPriceCents <= 0) {
        acc.errors.push(`[${index.toString()}] Unit Price Cents <= 0`);
      }
      const skuPriceKey = `${item.sku}:${item.unitPriceCents.toString()}`;
      if (uniqueSkus.has(skuPriceKey)) {
        acc.errors.push(
          `[${index.toString()}] Duplicated SKU in Order. Sku: ${item.sku}, Price: ${item.unitPriceCents.toString()}`,
        );
      } else {
        uniqueSkus.add(skuPriceKey);
      }
      return acc;
    },
    { errors: [] },
  );
  if (orderItemsValidation.errors.length > 0) {
    throw new Error(`Error in Order Items: ${orderItemsValidation.errors.join(`\n`)}`);
  }
  return {
    id,
    tenantId: input.tenantId,
    channel: input.channel,
    externalId: input.externalId,
    status: 'PENDING',
    items: input.items.map((i) => ({ ...i })),
    totalCents: orderTotalCents(input.items),
    currency: input.currency,
    version: 0,
    createdAt: now,
  };
};
