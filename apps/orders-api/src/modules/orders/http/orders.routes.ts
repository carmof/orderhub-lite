import { CreateOrderInputSchema, OrderDtoSchema, OrderStatusSchema } from '@orderhub/contracts';
import type { OrderRepository } from '../application/ports.js';
import type { FastifyPluginCallbackZod, ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { NotFoundError } from '../../../shared/errors.js';

const TenantHeaders = z.object({ 'x-tenant-id': z.uuid() });

export const ordersRoutes: FastifyPluginCallbackZod<{
  orderRepository: OrderRepository;
}> = function (app, opts, done) {
  const { orderRepository } = opts;

  const appType = app.withTypeProvider<ZodTypeProvider>();

  appType.post(
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
      const createdOrderDto = await orderRepository.create(tenantId, req.body);

      return reply.code(201).send(createdOrderDto);
    },
  );

  appType.get(
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
      const findOrderResponse = await orderRepository.findById(tenantId, orderId);

      if (!findOrderResponse) {
        throw new NotFoundError();
      }

      return reply.code(201).send(findOrderResponse);
    },
  );

  appType.get(
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
      const orderListResponse = await orderRepository.list(tenantId, {
        limit,
        ...(status !== undefined ? { status } : {}),
        ...(cursor !== undefined ? { cursor } : {}),
      });

      return reply.code(200).send(orderListResponse);
    },
  );

  done();
};
