export const ENV = {
  port: 3000,
  mongoURI: 'mongodb://localhost:27017/test',
  nodeEnv: 'test',
  apiPrefix: '/api',
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 100
  }
};