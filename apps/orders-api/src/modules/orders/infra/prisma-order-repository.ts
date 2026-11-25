import { type OrderDto, type OrderStatus } from '@orderhub/contracts';
import { type Prisma } from '#src/generated/prisma/client.js';
import type { OrderRepository } from '../application/ports.js';
import { type Order } from '../domain/order.js';

type DbOrderWithItems = Prisma.OrderGetPayload<{ include: { items: true } }>;

const mapDbOrderToDto = (dbOrder: DbOrderWithItems): OrderDto => ({
  id: dbOrder.id,
  channel: dbOrder.channel,
  createdAt: dbOrder.createdAt.toISOString(),
  currency: dbOrder.currency as OrderDto['currency'],
  externalId: dbOrder.externalId,
  items: dbOrder.items.map((item) => ({ ...item })),
  status: dbOrder.status,
  totalCents: dbOrder.totalCents,
  version: dbOrder.version,
});

export class PrismaOrderRepository implements OrderRepository {
  constructor(private readonly db: Prisma.TransactionClient) {}

  async add(input: Order): Promise<void> {
    await this.db.order.create({
      include: {
        items: true,
      },
      data: {
        channel: input.channel,
        currency: input.currency,
        externalId: input.externalId,
        tenantId: input.tenantId,
        totalCents: input.totalCents,
        items: {
          create: input.items.map((orderItem) => {
            return {
              quantity: orderItem.quantity,
              sku: orderItem.sku,
              unitPriceCents: orderItem.unitPriceCents,
            };
          }),
        },
      },
    });
  }

  async findById(tenantId: string, id: string): Promise<OrderDto | null> {
    const findFirstResponse = await this.db.order.findFirst({
      where: { id, tenantId },
      include: { items: true },
    });
    if (findFirstResponse) {
      return mapDbOrderToDto(findFirstResponse);
    }
    return null;
  }

  async list(
    tenantId: string,
    query: { status?: OrderStatus; limit: number; cursor?: string },
  ): Promise<{ items: OrderDto[]; nextCursor: string | null }> {
    const findManyResponse = await this.db.order.findMany({
      where: {
        tenantId: tenantId,
        ...(query.status && { status: query.status }),
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      ...(query.cursor && { cursor: { id: query.cursor }, skip: 1 }),
      take: query.limit + 1,
      include: {
        items: true,
      },
    });
    const items = findManyResponse.slice(0, query.limit);
    const lastItem = items.at(-1);

    return {
      items: items.map(mapDbOrderToDto),
      nextCursor: findManyResponse.length > query.limit && lastItem ? lastItem.id : null,
    };
  }
}
