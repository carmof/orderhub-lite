import type { CreateOrderInput } from '@orderhub/contracts';
import type { StoredResponse } from '#src/shared/idempotency/idempotency-keys.js';
import type { UnitOfWork } from '#src/shared/uow/unit-of-work.js';
import { placeOrder } from '../domain/order.js';
import { toOrderDto } from './order-dto.js';
import type { OrdersTx } from './ports.js';

export type ReceiveResult =
  | {
      kind: 'created' | 'replay';
      response: StoredResponse;
    }
  | { kind: 'mismatch' };

export type ReceiveChannelOrder = ReturnType<typeof makeReceiveChannelOrder>;

export const makeReceiveChannelOrder = (deps: { unitOfWork: UnitOfWork<OrdersTx> }) => {
  const receiveChannelOrder = (
    tenantId: string,
    idempotencyKey: string,
    requestHash: string,
    input: CreateOrderInput,
  ): Promise<ReceiveResult> => {
    return deps.unitOfWork.run<ReceiveResult>(async ({ orders, idempotency }) => {
      const claim = await idempotency.claim(tenantId, idempotencyKey, requestHash);
      if (claim.kind !== 'new') {
        return claim;
      }
      const order = placeOrder({ tenantId, ...input });
      await orders.add(order);
      const response = { status: 201, body: toOrderDto(order) };
      await idempotency.complete(tenantId, idempotencyKey, response);
      return { kind: 'created', response };
    });
  };

  return receiveChannelOrder;
};
