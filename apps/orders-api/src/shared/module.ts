import type { FastifyPluginAsync } from 'fastify';

export interface ServiceModule<Api = unknown> {
  name: string;
  api: Api;
  http?: FastifyPluginAsync;
  close?: () => Promise<void>;
}
