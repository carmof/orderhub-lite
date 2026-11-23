import type { OrderDto, OrderStatus } from '@orderhub/contracts';
import type { Order } from '../domain/order.js';

export interface OrderRepository {
  add(order: Order): Promise<void>;
  findById(tenantId: string, id: string): Promise<OrderDto | null>;
  list(
    tenantId: string,
    query: { status?: OrderStatus; limit: number; cursor?: string },
  ): Promise<{ items: OrderDto[]; nextCursor: string | null }>;
}

export type OrderReads = Pick<OrderRepository, 'findById' | 'list'>;
