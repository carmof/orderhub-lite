import { afterEach, beforeEach, describe, expect, it, test, vi } from 'vitest';
import { placeOrder, type OrderItem, type PlaceOrderInput } from './order.js';

const generateMockItems = (dataArr: Partial<OrderItem>[]): OrderItem[] => {
  return dataArr.map((data, index) => ({
    quantity: 1,
    sku: `SKU${index.toString()}`,
    unitPriceCents: 10,
    ...data,
  }));
};

const generateInput = (overrides: Partial<PlaceOrderInput> = {}): PlaceOrderInput => ({
  tenantId: 'tenant-1',
  channel: 'web',
  externalId: 'ext-1',
  currency: 'BRL',
  items: generateMockItems([
    { quantity: 1, unitPriceCents: 10 },
    { quantity: 3, unitPriceCents: 7 },
  ]),
  ...overrides,
});

describe('Order aggregate - placeOrder', () => {
  describe('valid input', () => {
    it('creates a PENDING order with version 0 and the provided id and date', () => {
      const now = new Date('2026-01-01T00:00:00.000Z');
      const input = generateInput();

      const order = placeOrder(input, 'order-1', now);

      expect(order).toEqual({
        id: 'order-1',
        tenantId: 'tenant-1',
        channel: 'web',
        externalId: 'ext-1',
        status: 'PENDING',
        items: input.items,
        totalCents: 31,
        currency: 'BRL',
        version: 0,
        createdAt: now,
      });
    });

    describe('defaults', () => {
      beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-06-15T12:00:00.000Z'));
      });

      afterEach(() => {
        vi.useRealTimers();
      });

      it('generates a UUID id and uses the current time when not provided', () => {
        const order = placeOrder(generateInput());

        expect(order.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
        expect(order.createdAt).toEqual(new Date('2026-06-15T12:00:00.000Z'));
      });
    });

    it('copies items so later changes to the input do not affect the order', () => {
      const input = generateInput();

      const order = placeOrder(input, 'order-1');
      const [firstInput] = input.items;
      const [firstOrderItem] = order.items;
      if (!firstInput || !firstOrderItem) throw new Error('missing items');
      firstInput.quantity = 999;

      expect(firstOrderItem).not.toBe(firstInput);
      expect(firstOrderItem.quantity).toBe(1);
      expect(order.totalCents).toBe(31);
    });

    it('allows the same SKU with different unit prices', () => {
      const items = generateMockItems([
        { sku: 'A', unitPriceCents: 10 },
        { sku: 'A', unitPriceCents: 20 },
      ]);

      expect(placeOrder(generateInput({ items }), 'order-1').totalCents).toBe(30);
    });
  });

  describe('invalid input', () => {
    it('throws when there are no items', () => {
      expect(() => placeOrder(generateInput({ items: [] }))).toThrow(/Order items can't be zero/);
    });

    test.for<[string, Partial<OrderItem>, RegExp]>([
      ['quantity is zero', { quantity: 0 }, /\[0\] Quantity <= 0/],
      ['quantity is negative', { quantity: -1 }, /\[0\] Quantity <= 0/],
      ['unit price is zero', { unitPriceCents: 0 }, /\[0\] Unit Price Cents <= 0/],
      ['unit price is negative', { unitPriceCents: -5 }, /\[0\] Unit Price Cents <= 0/],
    ])('throws when %s', ([, item, expected]) => {
      const items = generateMockItems([item]);

      expect(() => placeOrder(generateInput({ items }))).toThrow(expected);
    });

    it('throws when the same SKU and price appear twice', () => {
      const items = generateMockItems([
        { sku: 'A', unitPriceCents: 10 },
        { sku: 'A', unitPriceCents: 10 },
      ]);

      expect(() => placeOrder(generateInput({ items }))).toThrow(
        /\[1\] Duplicated SKU in Order\. Sku: A, Price: 10/,
      );
    });

    it('reports every violation with its item index in a single error', () => {
      const items = generateMockItems([
        { quantity: 0 },
        { unitPriceCents: 0 },
        { sku: 'A' },
        { sku: 'A' },
      ]);

      let message = '';
      try {
        placeOrder(generateInput({ items }));
      } catch (error) {
        message = (error as Error).message;
      }

      expect(message).toContain('Error in Order Items:');
      expect(message).toContain('[0] Quantity <= 0');
      expect(message).toContain('[1] Unit Price Cents <= 0');
      expect(message).toContain('[3] Duplicated SKU in Order');
    });

    it('throws when the total is not a safe integer', () => {
      const items = generateMockItems([{ quantity: 3, unitPriceCents: Number.MAX_SAFE_INTEGER }]);

      expect(() => placeOrder(generateInput({ items }))).toThrow(
        /Calculated TotalCents is not a Safe Integer/,
      );
    });
  });
});
