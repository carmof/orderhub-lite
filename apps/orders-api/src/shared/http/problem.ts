import type { FastifyReply } from 'fastify';

/** RFC 7807-style problem-details payload. */
export type ProblemDetails<S extends number = number> = {
  type: string;
  title: string;
  status: S;
  detail?: string;
  instance: string;
} & Record<string, unknown>;

/**
 * A reply whose `code(S)` accepts a problem-details payload. A route's typed reply only
 * satisfies this when its response schema declares status `S` with a problem-compatible shape.
 */
type ProblemReply<S extends number> = {
  code(statusCode: S): { send(payload: ProblemDetails<S>): FastifyReply };
};

/**
 * Sends an RFC 7807-style problem-details response.
 *
 * The reply's own type is kept, so the call fails to compile when the route's response
 * schema does not declare `status`, or declares it with a body that is not problem-shaped.
 *
 * @param reply - The Fastify reply used to send the response.
 * @param status - The HTTP status code for the problem.
 * @param title - A short, human-readable summary of the problem.
 * @param detail - An optional human-readable explanation of the problem.
 * @param extra - Additional fields to include in the problem-details payload.
 */
export function problem<S extends number>(
  reply: ProblemReply<NoInfer<S>>,
  status: S,
  title: string,
  detail?: string,
  extra?: Record<string, unknown>,
): FastifyReply {
  const r = reply as unknown as FastifyReply;
  return r
    .code(status)
    .type('application/problem+json')
    .send({ type: 'about:blank', title, status, detail, instance: r.request.url, ...extra });
}
