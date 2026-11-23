import type { OrderDto } from '@orderhub/contracts';
import type { ServiceModule } from '../../shared/module.js';
import { makeCreateOrder } from './application/create-order.js';
import { ordersHttpPlugin } from './http/orders.http.js';
import { InMemoryOrderRepository } from './infra/in-memory-order-repository.js';

export type OrdersApi = { findOrder(tenantId: string, id: string): Promise<OrderDto | null> };

export function createOrdersModule(): ServiceModule<OrdersApi> {
  const repo = new InMemoryOrderRepository();
  const createOrder = makeCreateOrder({ orderRepository: repo });
  return {
    name: 'orders',
    api: { findOrder: (tenantId, id) => repo.findById(tenantId, id) },
    httpPlugin: ordersHttpPlugin({
      createOrder,
      orderReads: repo,
    }),
  };
}
