import type { FastifyPluginAsync } from 'fastify';
import type { CreateOrder } from '../application/create-order.js';
import type { OrderReads } from '../application/ports.js';
import { ordersRoutes } from './orders.routes.js';
import { OrdersWebhookRoutes } from './webhooks.routes.js';

export function ordersHttpPlugin(deps: {
  createOrder: CreateOrder;
  orderReads: OrderReads;
}): FastifyPluginAsync {
  return async (app) => {
    await app.register(ordersRoutes, { ...deps, prefix: 'v1' });
    await app.register(OrdersWebhookRoutes, { ...deps, prefix: 'v1' });
  };
}
