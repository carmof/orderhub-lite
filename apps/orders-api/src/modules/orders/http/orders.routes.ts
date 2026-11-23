import { CreateOrderInputSchema, OrderDtoSchema, OrderStatusSchema } from '@orderhub/contracts';
import type { FastifyPluginCallbackZod, ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { NotFoundError } from '../../../shared/errors.js';
import type { CreateOrder } from '../application/create-order.js';
import type { OrderReads } from '../application/ports.js';

const TenantHeaders = z.object({ 'x-tenant-id': z.uuid() });

export const ordersRoutes: FastifyPluginCallbackZod<{
  createOrder: CreateOrder;
  orderReads: OrderReads;
}> = function (app, opts, done) {
  const appTyped = app.withTypeProvider<ZodTypeProvider>();

  appTyped.post(
    '/orders',
    {
      schema: {
        headers: TenantHeaders,
        body: CreateOrderInputSchema,
        response: { 201: OrderDtoSchema },
      },
    },
    async (req, reply) => {
      const tenantId = req.headers['x-tenant-id'];
      const createdOrder = await opts.createOrder(tenantId, req.body);

      return reply
        .code(201)
        .header('location', `${appTyped.prefix}/orders/${createdOrder.id}}`)
        .send(createdOrder);
    },
  );

  appTyped.get(
    '/orders/:id',
    {
      schema: {
        headers: TenantHeaders,
        params: z.object({ id: z.uuidv4() }),
        response: { 201: OrderDtoSchema.nullable() },
      },
    },
    async (req, reply) => {
      const tenantId = req.headers['x-tenant-id'];
      const orderId = req.params.id;
      const findOrderResponse = await opts.orderReads.findById(tenantId, orderId);

      if (!findOrderResponse) {
        throw new NotFoundError();
      }

      return reply.code(201).send(findOrderResponse);
    },
  );

  appTyped.get(
    '/orders',
    {
      schema: {
        headers: TenantHeaders,
        querystring: z.object({
          status: OrderStatusSchema.optional(),
          limit: z.coerce.number().int().min(1).max(100).default(20),
          cursor: z.string().optional(),
        }),
        response: {
          200: z.object({ items: z.array(OrderDtoSchema), nextCursor: z.string().nullable() }),
        },
      },
    },
    async (req, reply) => {
      const tenantId = req.headers['x-tenant-id'];
      const { status, limit, cursor } = req.query;
      const orderListResponse = await opts.orderReads.list(tenantId, {
        limit,
        ...(status !== undefined ? { status } : {}),
        ...(cursor !== undefined ? { cursor } : {}),
      });

      return reply.code(200).send(orderListResponse);
    },
  );

  done();
};
