import { OrderDtoSchema } from '@orderhub/contracts';
import { describe, expect, it } from 'vitest';
import { type Order } from '../domain/order.js';
import { toOrderDto } from './order-dto.js';

const generateOrder = (overrides: Partial<Order> = {}): Order => ({
  id: 'order-1',
  tenantId: 'tenant-1',
  channel: 'web',
  externalId: 'ext-1',
  status: 'PENDING',
  items: [
    { sku: 'A', quantity: 1, unitPriceCents: 10 },
    { sku: 'B', quantity: 3, unitPriceCents: 7 },
  ],
  totalCents: 31,
  currency: 'BRL',
  version: 0,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  ...overrides,
});

describe('toOrderDto', () => {
  it('maps every public field and formats createdAt as ISO string', () => {
    expect(toOrderDto(generateOrder())).toEqual({
      id: 'order-1',
      channel: 'web',
      externalId: 'ext-1',
      status: 'PENDING',
      items: [
        { sku: 'A', quantity: 1, unitPriceCents: 10 },
        { sku: 'B', quantity: 3, unitPriceCents: 7 },
      ],
      totalCents: 31,
      currency: 'BRL',
      version: 0,
      createdAt: '2026-01-01T00:00:00.000Z',
    });
  });

  it('does not expose tenantId', () => {
    expect(toOrderDto(generateOrder())).not.toHaveProperty('tenantId');
  });

  it('returns copies of the items, not the aggregate references', () => {
    const order = generateOrder();

    const dto = toOrderDto(order);

    expect(dto.items).not.toBe(order.items);
    expect(dto.items[0]).not.toBe(order.items[0]);
  });

  it('produces a result that satisfies OrderDtoSchema', () => {
    expect(() => OrderDtoSchema.parse(toOrderDto(generateOrder()))).not.toThrow();
  });
});
