import { z } from 'zod';

export const OrderStatusSchema = z.enum(['PENDING', 'RESERVED', 'PAID', 'SHIPPED', 'CANCELLED']);
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export const OrderCurrencySchema = z.enum(['BRL']);
export type OrderCurrency = z.infer<typeof OrderCurrencySchema>;

const OrderItem = z.object({
  sku: z.string(),
  quantity: z.int().min(1),
  unitPriceCents: z.int().min(0),
});

export const CreateOrderInputSchema = z.object({
  externalId: z.string(),
  channel: z.string(),
  items: z.array(OrderItem).min(1),
  currency: OrderCurrencySchema,
});

export type CreateOrderInput = z.infer<typeof CreateOrderInputSchema>;

export const OrderDtoSchema = z.object({
  id: z.string().min(1),
  channel: z.string().min(1),
  externalId: z.string().min(1),
  status: OrderStatusSchema,
  items: z.array(OrderItem).min(1),
  totalCents: z.number(),
  currency: OrderCurrencySchema,
  version: z.number(),
  createdAt: z.iso.datetime(),
});

export type OrderDto = z.infer<typeof OrderDtoSchema>;
