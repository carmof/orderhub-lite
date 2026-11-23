import type { OrderDto, OrderStatus } from '@orderhub/contracts';
import { toOrderDto } from '../application/order-dto.js';
import type { OrderRepository } from '../application/ports.js';
import type { Order } from '../domain/order.js';

export class InMemoryOrderRepository implements OrderRepository {
  private memoryById: Map<string, Order>;
  private memoryByTenant: Map<string, Order[]>;

  constructor() {
    this.memoryById = new Map();
    this.memoryByTenant = new Map();
  }

  add(order: Order): Promise<void> {
    this.memoryById.set(order.id, order);

    this.memoryByTenant.set(
      order.tenantId,
      (this.memoryByTenant.get(order.tenantId) || []).concat([order]),
    );
    return Promise.resolve();
  }

  findById(tenantId: string, id: string): Promise<OrderDto | null> {
    const register = this.memoryById.get(id);
    if (!register) {
      return Promise.resolve(null);
    }
    if (register.tenantId !== tenantId) {
      return Promise.resolve(null);
    }

    return Promise.resolve(toOrderDto(register));
  }

  list(
    tenantId: string,
    query: { status?: OrderStatus; limit: number; cursor?: string },
  ): Promise<{ items: OrderDto[]; nextCursor: string | null }> {
    const orders = this.memoryByTenant.get(tenantId) ?? [];
    let i = 0;
    while (query.cursor && orders[i]?.id !== query.cursor && i < orders.length) {
      i++;
    }
    const items: OrderDto[] = [];
    let nextCursor: string | null = null;
    for (i; i < orders.length && items.length <= query.limit; i++) {
      const order = orders[i];
      if (order) {
        if (query.status === undefined || order.status === query.status) {
          items.push(toOrderDto(order));
          nextCursor = order.id;
        }
      }
    }
    return Promise.resolve({ items, nextCursor });
  }
}
