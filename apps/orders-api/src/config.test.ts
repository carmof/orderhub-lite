import { loadConfig, type Config } from './config.js';
import { describe, test, expect } from 'vitest';

describe('loadConfig', () => {
  test('should load the configuration correctly', () => {
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
