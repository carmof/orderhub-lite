import type { OrderDto } from '@orderhub/contracts';
import type { Order } from '../domain/order.js';

export const toOrderDto = (order: Order): OrderDto => ({
  id: order.id,
  channel: order.channel,
  externalId: order.externalId,
  status: order.status,
  items: order.items.map(({ sku, quantity, unitPriceCents }) => ({
    sku,
    quantity,
    unitPriceCents,
  })),
  totalCents: order.totalCents,
  currency: order.currency,
  version: order.version,
  createdAt: order.createdAt.toISOString(),
});
