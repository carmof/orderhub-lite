import type { FastifyPluginAsync } from 'fastify';

export interface ServiceModule<Api = unknown> {
  name: string;
  api: Api;
  httpPlugin?: FastifyPluginAsync;
  close?: () => Promise<void>;
}
