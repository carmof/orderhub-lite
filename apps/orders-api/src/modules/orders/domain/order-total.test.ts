import { type OrderItem } from '@orderhub/contracts';
import { orderTotalCents } from './order-total.js';
import { describe, expect, it, test } from 'vitest';

const generateMockItems = (dataArr: Partial<OrderItem>[]): OrderItem[] => {
  return dataArr.map((data, index) => {
    return {
      quantity: 1,
      sku: `SKU${index.toString()}`,
      unitPriceCents: 10,
      ...data,
    };
  });
};

describe.concurrent('Order Total', () => {
  it('When all items are valid, then calculation should succeed', () => {
    const mockItems = generateMockItems([
      { quantity: 1, unitPriceCents: 10 },
      { quantity: 3, unitPriceCents: 7 },
    ]);

    expect(orderTotalCents(mockItems)).toEqual(31);
  });

  test.for<OrderItem[]>([
    generateMockItems([
      { quantity: 1, unitPriceCents: 10 },
      { quantity: 3, unitPriceCents: 2 ** 53 },
    ]),
    generateMockItems([
      { quantity: 1, unitPriceCents: NaN },
      { quantity: 3, unitPriceCents: 7 },
    ]),
  ])('When total sum is not safe, then throw', (mockItems) => {
    expect(() => orderTotalCents(mockItems)).toThrow(/Calculated TotalCents is not a Safe Integer/);
  });
});
