import { createHash } from 'crypto';
import type { FastifyPluginCallbackZod, ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';
import { type FastifyRequest } from 'fastify';
import type { OrderRepository } from '../application/ports.js';
import { CreateOrderInputSchema, OrderDtoSchema } from '@orderhub/contracts';
import { problem } from '../../../shared/http/problem.js';

const HEADERS_SCHEMA = z.object({
  'x-tenant-id': z.uuid(),
  'idempotency-key': z.string().min(8).max(255),
});

const generateFingerprint = (request: FastifyRequest) => {
  return createHash('sha256').update(JSON.stringify(request.body)).digest('hex');
};

type OrderDto = z.infer<typeof OrderDtoSchema>;

const memory = new Map<
  string,
  {
    fingerprint: string;
    state: 'in_progress' | 'done';
    status?: 201;
    body?: OrderDto;
  }
>();

export const OrdersWebhookRoutes: FastifyPluginCallbackZod<{
  orderRepository: OrderRepository;
}> = function (app, opts) {
  const { orderRepository } = opts;
  const appType = app.withTypeProvider<ZodTypeProvider>();

  appType.post(
    '/webhooks/:channel/orders',
    {
      schema: {
        headers: HEADERS_SCHEMA,
        params: z.object({ channel: z.string().min(1) }),
        body: CreateOrderInputSchema,
        response: { 201: OrderDtoSchema },
      },
    },
    async function (req, reply) {
      const tenantId = req.headers['x-tenant-id'];
      const idempotencyKey = req.headers['idempotency-key'];
      const fingerprint = generateFingerprint(req);
      const memoryKey = `${tenantId}:idempotencyKey`;

      const idempotencyRegister = memory.get(memoryKey);

      if (idempotencyRegister) {
        if (idempotencyRegister.fingerprint !== fingerprint) {
          problem(reply, 422, 'Unprocessable Entity', 'Idempotency match failed');
          return reply;
        }
        if (idempotencyRegister.state === 'in_progress') {
          problem(reply, 409, 'Conflict', 'Request already being processed');
          return reply;
        }
        if (!idempotencyRegister.body) {
          throw new Error('Memory map for idempotency is missing body for done request');
        }
        return reply
          .status(idempotencyRegister.status || 201)
          .header('idempotent-replayed', 'true')
          .send(idempotencyRegister.body);
      }

      memory.set(memoryKey, { fingerprint, state: 'in_progress' });

      try {
        const order = await orderRepository.create(tenantId, req.body);
        memory.set(memoryKey, { fingerprint, state: 'done', body: order, status: 201 });

        return await reply.status(201).send(order);
      } catch (err) {
        memory.delete(idempotencyKey);
        throw err;
      }
    },
  );
};
