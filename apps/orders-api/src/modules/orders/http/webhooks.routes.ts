import { createHash } from 'crypto';
import {
  CreateOrderInputSchema,
  OrderDtoSchema,
  problemResponseDtoSchema,
  type OrderDto,
} from '@orderhub/contracts';
import { problem } from '#src/shared/http/problem.js';
import { idempotencyReplayReply } from '#src/shared/http/replay.js';
import { type FastifyRequest } from 'fastify';
import type { FastifyPluginCallbackZod, ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';
import type { ReceiveChannelOrder } from '../application/receive-channel-order.js';

const HEADERS_SCHEMA = z.object({
  'x-tenant-id': z.uuid(),
  'idempotency-key': z.string().min(8).max(255),
});

const generateFingerprint = (request: FastifyRequest) => {
  return createHash('sha256').update(JSON.stringify(request.body)).digest('hex');
};

export const OrdersWebhookRoutes: FastifyPluginCallbackZod<{
  receiveChannelOrder: ReceiveChannelOrder;
}> = function (app, opts) {
  const appTyped = app.withTypeProvider<ZodTypeProvider>();

  appTyped.post(
    '/webhooks/:channel/orders',
    {
      schema: {
        headers: HEADERS_SCHEMA,
        params: z.object({ channel: z.string().min(1) }),
        body: CreateOrderInputSchema,
        response: {
          201: OrderDtoSchema,
          422: problemResponseDtoSchema,
        },
      },
    },
    async function (req, reply) {
      const tenantId = req.headers['x-tenant-id'];
      const idempotencyKey = req.headers['idempotency-key'];
      const fingerprint = generateFingerprint(req);

      const useCaseResponse = await opts.receiveChannelOrder(
        tenantId,
        idempotencyKey,
        fingerprint,
        req.body,
      );
      if (useCaseResponse.kind === 'replay') {
        if (useCaseResponse.response.status !== 201) {
          throw new Error(`unexpected stored status`);
        }
        return idempotencyReplayReply(
          reply,
          useCaseResponse.response.status,
          useCaseResponse.response.body as OrderDto,
        );
      }

      if (useCaseResponse.kind === 'mismatch') {
        return problem(reply, 422, 'Unprocessable Entity', 'Idempotency match failed');
      }

      return reply.status(201).send(useCaseResponse.response.body as OrderDto);
    },
  );
};
