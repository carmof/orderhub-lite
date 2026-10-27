import { z } from 'zod';

export const OrderStatus = z.enum([
  'PENDING',
  'RESERVED',
  'PAID',
  'SHIPPED',
  'CANCELLED',
  'CHANGE',
]);

const OrderItem = z.object({
  sku: z.string(),
  quantity: z.int().min(0),
  unitPriceCents: z.int().min(0),
});

export const CreateOrderInputSchema = z.object({
  externalId: z.string(),
  channel: z.string(),
  items: z.array(OrderItem),
  currency: z.literal('BRL'),
});

export type CreateOrderInput = z.infer<typeof CreateOrderInputSchema>;
