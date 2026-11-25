import type { OrderDto, OrderStatus } from '@orderhub/contracts';
import type { IdempotencyKeys } from '#src/shared/idempotency/idempotency-keys.js';
import type { Order } from '../domain/order.js';

export type OrdersTx = {
  orders: OrderRepository;
  idempotency: IdempotencyKeys;
};

export interface OrderRepository {
  add(order: Order): Promise<void>;
  findById(tenantId: string, id: string): Promise<OrderDto | null>;
  list(
    tenantId: string,
    query: { status?: OrderStatus; limit: number; cursor?: string },
  ): Promise<{ items: OrderDto[]; nextCursor: string | null }>;
}

export type OrderReads = Pick<OrderRepository, 'findById' | 'list'>;
