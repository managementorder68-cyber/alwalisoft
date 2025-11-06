// Jest setup file for global test configuration

// Extend Jest timeout for async operations
jest.setTimeout(30000);

// Mock environment variables for tests
// Note: NODE_ENV is read-only, so we skip it
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.REDIS_URL = 'redis://localhost:6379/1';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.TELEGRAM_BOT_TOKEN = 'test-bot-token';

// Global test utilities
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};
