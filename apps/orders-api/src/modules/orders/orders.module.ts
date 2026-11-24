import type { OrderDto } from '@orderhub/contracts';
import type { Infra } from '#src/shared/infra.js';
import type { ServiceModule } from '../../shared/module.js';
import { makeCreateOrder } from './application/create-order.js';
import { ordersHttpPlugin } from './http/orders.http.js';
import { PrismaOrderRepository } from './infra/prisma-order-repository.js';

export type OrdersApi = { findOrder(tenantId: string, id: string): Promise<OrderDto | null> };

export function createOrdersModule(deps: { infra: Infra }): ServiceModule<OrdersApi> {
  const repo = new PrismaOrderRepository(deps.infra.prismaDb);
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
