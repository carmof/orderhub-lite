export type StoredResponse = {
  status: number | null;
  body: unknown;
};

export type Claim =
  | { kind: 'new' }
  | {
      kind: 'replay';
      response: StoredResponse;
    }
  | { kind: 'mismatch' };

export interface IdempotencyKeys {
  claim(tenantId: string, key: string, requestHash: string): Promise<Claim>;
  complete(tenantId: string, key: string, response: StoredResponse): Promise<void>;
}
