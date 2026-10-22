import { loadConfig } from './config.js';
import { describe, expect, it, vi, afterEach } from 'vitest';

describe('loadConfig', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should load config with default port', () => {
    const config = loadConfig();
    expect(config.port).toBe(3000);
  });

  it('should load config with environment port', () => {
    vi.stubEnv('PORT', '4000');
    const config = loadConfig();
    expect(config.port).toBe(4000);
    delete process.env['PORT'];
  });
});
