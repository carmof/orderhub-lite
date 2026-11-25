import type { OrderDto } from '@orderhub/contracts';
import { prismaUnitOfWork } from '#src/shared/db/prisma-unit-of-work.js';
import { PrismaIdempotencyKeys } from '#src/shared/idempotency/prisma-idempotency-keys.js';
import type { Infra } from '#src/shared/infra.js';
import type { ServiceModule } from '#src/shared/module.js';
import { makeCreateOrder } from './application/create-order.js';
import { makeReceiveChannelOrder } from './application/receive-channel-order.js';
import { ordersHttpPlugin } from './http/orders.http.js';
import { PrismaOrderRepository } from './infra/prisma-order-repository.js';

export type OrdersApi = { findOrder(tenantId: string, id: string): Promise<OrderDto | null> };

export function createOrdersModule(deps: { infra: Infra }): ServiceModule<OrdersApi> {
  const repo = new PrismaOrderRepository(deps.infra.prismaDb);
  const createOrder = makeCreateOrder({ orderRepository: repo });
  const unitOfWork = prismaUnitOfWork(deps.infra.prismaDb, (tx) => ({
    orders: new PrismaOrderRepository(tx),
    idempotency: new PrismaIdempotencyKeys(tx),
  }));

  const receiveChannelOrder = makeReceiveChannelOrder({ unitOfWork });
  return {
    name: 'orders',
    api: { findOrder: (tenantId, id) => repo.findById(tenantId, id) },
    httpPlugin: ordersHttpPlugin({
      createOrder,
      receiveChannelOrder,
      orderReads: repo,
    }),
  };
}
