// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  globalSetup: './globalSetup.ts',
  globalTeardown: './globalTeardown.ts',
  testTimeout: 30000,
  // testSequentially: true, // Uncomment if parallel execution still causes issues
  
  // Coverage configuration
  coverageThreshold: {
    global: {
      branches: 40,
      functions: 40,
      lines: 40,
      statements: 40
    }
  },
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
    '/__mocks__/',
    '/tests/helpers/',
    '.d.ts$'
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.interface.ts',
    '!src/types/**/*',
    '!src/**/__mocks__/**/*'
  ],
  
  // Test pattern configuration
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  
  // Additional settings
  verbose: true,
  clearMocks: true,
  restoreMocks: true,
  resetMocks: true,
};