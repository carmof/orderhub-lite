import type { FastifyReply } from 'fastify';

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
