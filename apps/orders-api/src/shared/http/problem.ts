import type { FastifyReply } from 'fastify';

/**
 * Sends an RFC 7807-style problem-details response.
 *
 * @param reply - The Fastify reply used to send the response.
 * @param status - The HTTP status code for the problem.
 * @param title - A short, human-readable summary of the problem.
 * @param detail - An optional human-readable explanation of the problem.
 * @param extra - Additional fields to include in the problem-details payload.
 */
export function problem(
  reply: FastifyReply,
  status: number,
  title: string,
  detail?: string,
  extra?: Record<string, unknown>,
) {
  reply
    .code(status)
    .type('application/problem+json')
    .send({ type: 'about:blank', title, status, detail, instance: reply.request.url, ...extra });
}
