import type { FastifyReply } from 'fastify';

/**
 * A reply whose `code(S)` accepts a body of type `B`. A route's typed reply only satisfies
 * this when its response schema declares status `S` with a shape that `B` matches.
 */
type ReplayReply<S extends number, B> = {
  code(statusCode: S): { send(payload: B): FastifyReply };
};

/**
 * Replays a stored idempotent response, marking it with the `idempotent-replayed` header.
 *
 * The reply's own type is kept, so the call fails to compile when the route's response
 * schema does not declare `status`, or when `body` does not match that status's schema.
 * `status` must be a literal code (narrow a stored `number` first, e.g. `if (s !== 201) throw`):
 * a plain `number` would otherwise slip past the schema check.
 *
 * @param reply - The Fastify reply used to send the response.
 * @param status - The stored HTTP status code to replay.
 * @param body - The stored response body to replay.
 */
export function idempotencyReplayReply<S extends number, B>(
  reply: ReplayReply<NoInfer<S>, NoInfer<B>>,
  status: S & (number extends S ? never : unknown),
  body: B,
): FastifyReply {
  const r = reply as unknown as FastifyReply;
  return r.code(status).header('idempotent-replayed', 'true').send(body);
}
