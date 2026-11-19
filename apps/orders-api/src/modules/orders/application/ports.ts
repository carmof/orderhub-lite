import type { CreateOrderInput, OrderDto, OrderStatus } from '@orderhub/contracts';
import type { Tx } from '../../../shared/db/tx.js';

export interface OrderRepository {
  create(tenantId: string, input: CreateOrderInput, tx?: Tx): Promise<OrderDto>;
  findById(tenantId: string, id: string): Promise<OrderDto | null>;
  list(
    tenantId: string,
    query: { status?: OrderStatus; limit: number; cursor?: string },
  ): Promise<{ items: OrderDto[]; nextCursor: string | null }>;
}
