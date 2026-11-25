import { type Prisma } from '#src/generated/prisma/client.js';
import { claimIdempotencyKey } from '#src/generated/prisma/sql.js';
import type { Claim, IdempotencyKeys, StoredResponse } from './idempotency-keys.js';

class PrismaIdempotencyKeys implements IdempotencyKeys {
  constructor(private readonly db: Prisma.TransactionClient) {}

  async claim(tenantId: string, key: string, requestHash: string): Promise<Claim> {
    const queryResult = await this.db.$queryRawTyped(
      claimIdempotencyKey(tenantId, key, requestHash),
    );

    if (queryResult.length === 1) {
      if (queryResult[0]?.key) {
        return {
          kind: 'new',
        };
      }
      throw new Error(`Expected created idempotency key not returned by query`);
    }

    const previousIdempotencyKey = await this.db.idempotencyKey.findUnique({
      where: {
        tenantId_key: {
          key,
          tenantId,
        },
      },
    });

    if (!previousIdempotencyKey) {
      throw new Error(`Expected Idempotency key is missing`);
    }

    if (previousIdempotencyKey.requestHash !== requestHash) {
      return {
        kind: 'mismatch',
      };
    }

    return {
      kind: 'replay',
      response: {
        body: previousIdempotencyKey.responseBody,
        status: previousIdempotencyKey.responseStatus,
      },
    };
  }

  async complete(tenantId: string, key: string, response: StoredResponse<201>): Promise<void> {
    await this.db.idempotencyKey.update({
      data: {
        state: 'DONE',
        responseBody: response.body as Prisma.InputJsonValue,
        responseStatus: response.status,
      },
      where: {
        tenantId_key: {
          key,
          tenantId,
        },
      },
    });
  }
}

export { PrismaIdempotencyKeys };
