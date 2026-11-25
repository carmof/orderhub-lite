export type StoredResponse<S = number> = {
  status: S | null;
  body: unknown;
};

export type Claim<S extends number = number> =
  | { kind: 'mismatch' }
  | { kind: 'new' }
  | {
      kind: 'replay';
      response: StoredResponse<S>;
    };

export interface IdempotencyKeys {
  claim(tenantId: string, key: string, requestHash: string): Promise<Claim>;
  complete(tenantId: string, key: string, response: StoredResponse): Promise<void>;
}
