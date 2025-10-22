const getServerMock = () => {
  const mockServer = new EventEmitter();
  Object.assign(mockServer, {
    address: () => ({ port: 3000 }),
    listening: true,
    close: (callback?: () => void) => {
      if (callback) callback();
    }
  });
  return mockServer;
};

import mongoose from 'mongoose';
import express from 'express';
import { EventEmitter } from 'node:events';
import { startServer } from '../server';

jest.mock('mongoose');

jest.mock('mongoose');
jest.mock('../config/env', () => ({
  ENV: {
    port: 3000,
    mongoURI: 'mongodb://localhost:27017/test',
    nodeEnv: 'test',
    apiPrefix: '/api',
    rateLimit: {
      windowMs: 15 * 60 * 1000,
      max: 100
    }
  }
}));

describe('Server Configuration', () => {
  let consoleErrorSpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;
  let processExitSpy: jest.SpyInstance;
  let mockServer: EventEmitter;

  let server: EventEmitter;

  beforeEach(() => {
    jest.resetModules();
    mockServer = getServerMock();
    jest.doMock('../app', () => {
      const app = express();
      app.listen = jest.fn().mockReturnValue(mockServer);
      return { __esModule: true, default: app };
    });
    
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    (mongoose.connect as jest.Mock).mockClear();
  });

  afterEach(async () => {
    if (server) {
      await new Promise<void>((resolve) => {
        server.emit('close');
        resolve();
      });
    }
    jest.clearAllMocks();
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
    processExitSpy.mockRestore();
  });

  it('should connect to MongoDB and start server', async () => {
    (mongoose.connect as jest.Mock).mockResolvedValueOnce(undefined);
    
    server = await startServer();
    
    expect(mongoose.connect).toHaveBeenCalledWith('mongodb://localhost:27017/test');
    
    const calls = consoleLogSpy.mock.calls.map(call => call[0]);
    expect(calls).toContain('MongoDB connected');
    expect(calls).toContain('Server running at http://localhost:3000');
  });

  it('should handle MongoDB connection error', async () => {
    const mockError = new Error('Connection failed');
    (mongoose.connect as jest.Mock).mockRejectedValueOnce(mockError);
    
    try {
      await startServer();
    } catch {
      // Catch the error to prevent it from failing the test
    }
    
    expect(consoleErrorSpy).toHaveBeenCalledWith('MongoDB connection error:', mockError);
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });

  it('should handle server error events', async () => {
    (mongoose.connect as jest.Mock).mockResolvedValueOnce(undefined);
    const mockError = new Error('Test server error');

    server = await startServer();
    expect(server).toHaveProperty('on'); // Should be a Server instance
    expect(typeof server.on).toBe('function'); // Should have event handling capabilities
    
    // Trigger error event
    server.emit('error', mockError);
    
    // Wait for next tick to allow error handler to execute
    await new Promise(resolve => process.nextTick(resolve));
    
    expect(consoleErrorSpy).toHaveBeenCalledWith('Server error:', mockError);
  });
});