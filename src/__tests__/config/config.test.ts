import { ENV } from '../../config/env';

describe('Environment Configuration Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should load default port if PORT not specified', () => {
    delete process.env.PORT;
    expect(ENV.port).toBe(5000); // default port in env.ts
  });

  it('should use environment PORT if specified', () => {
    process.env.PORT = '4000';
    // reload module so ENV picks up new env
    const { ENV: reloadedENV } = require('../../config/env');
    expect(reloadedENV.port).toBe(4000);
  });

  it('should have required database configuration', () => {
    expect(ENV.mongoURI).toBeDefined();
    expect(typeof ENV.mongoURI).toBe('string');
  });

  it('should have valid node environment', () => {
    expect(['development', 'production', 'test']).toContain(ENV.nodeEnv);
  });

  it('should handle invalid PORT value', () => {
    process.env.PORT = 'invalid';
    const { ENV: reloadedENV } = require('../../config/env');
    expect(reloadedENV.port).toBe(5000);
  });

  it('should have valid API prefix', () => {
    expect(ENV.apiPrefix).toMatch(/^\/api/);
  });
});