import type { CreateOrderInput, OrderDto, OrderStatus } from '@orderhub/contracts';
import type { OrderRepository } from '../application/ports.js';
import { randomUUID } from 'node:crypto';

export class InMemoryOrderRepository implements OrderRepository {
  private memoryById: Map<string, { tenantId: string; order: OrderDto }>;
  private memoryByTenant: Map<string, OrderDto[]>;

  constructor() {
    this.memoryById = new Map();
    this.memoryByTenant = new Map();
  }

  create(tenantId: string, input: CreateOrderInput): Promise<OrderDto> {
    const orderId = randomUUID();
    const totalCents = input.items.reduce((acc, item) => acc + item.unitPriceCents, 0);
    const order: OrderDto = {
      channel: input.channel,
      createdAt: new Date().toISOString(),
      currency: 'BRL',
      externalId: input.externalId,
      id: orderId,
      items: input.items,
      status: 'PENDING',
      totalCents,
      version: 0,
    };
    this.memoryById.set(orderId, {
      tenantId,
      order,
    });

    this.memoryByTenant.set(orderId, (this.memoryByTenant.get(tenantId) || []).concat([order]));

    return Promise.resolve(order);
  }

  findById(tenantId: string, id: string): Promise<OrderDto | null> {
    const register = this.memoryById.get(id);
    if (!register) {
      return Promise.resolve(null);
    }
    if (register.tenantId !== tenantId) {
      return Promise.resolve(null);
    }

    return Promise.resolve(register.order);
  }

  list(
    tenantId: string,
    query: { status?: OrderStatus; limit: number; cursor?: string },
  ): Promise<{ items: OrderDto[]; nextCursor: string | null }> {
    const orders = this.memoryByTenant.get(tenantId) ?? [];
    let i = 0;
    do {
      i++;
    } while (orders[i]?.id !== query.cursor && i < orders.length);
    const items: OrderDto[] = [];
    let nextCursor: string | null = null;
    for (i; i < orders.length && items.length <= query.limit; i++) {
      const order = orders[i];
      if (order && order.status === query.status) {
        items.push(order);
        nextCursor = order.id;
      }
    }
    return Promise.resolve({ items, nextCursor });
  }
}
