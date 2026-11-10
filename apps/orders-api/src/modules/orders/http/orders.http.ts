import type { FastifyPluginAsync } from 'fastify';
import type { OrderRepository } from '../application/ports.js';
import { ordersRoutes } from './orders.routes.js';
import { OrdersWebhookRoutes } from './webhooks.routes.js';

export function ordersHttpPlugin(deps: { orderRepository: OrderRepository }): FastifyPluginAsync {
  return async (app) => {
    await app.register(ordersRoutes, { ...deps, prefix: 'v1' });
    await app.register(OrdersWebhookRoutes, { ...deps, prefix: 'v1' });
  };
}
