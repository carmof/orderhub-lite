import { describe, expect, test } from 'vitest';
import { loadConfig, type Config } from './config.js';

describe('loadConfig', () => {
  test('should load the configuration correctly with default values', () => {
    const expectedResult: Config = {
      DATABASE_URL: 'postgres://localhost/test',
      LOG_LEVEL: 'info',
      NODE_ENV: 'development',
      PORT: 3000,
    };
    const config = loadConfig({ DATABASE_URL: 'postgres://localhost/test' });
    expect(config).toEqual(expectedResult);
  });
});
