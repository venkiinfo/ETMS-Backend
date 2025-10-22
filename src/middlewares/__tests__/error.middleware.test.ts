import { Request, Response } from 'express';
import errorMiddleware from '../error.middleware';

describe('Error Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;
  const originalEnv = process.env.NODE_ENV;
  const originalConsoleError = console.error;

  beforeEach(() => {
    mockRequest = {
      body: { test: 'data' }
    } as Partial<Request>;
    (mockRequest as any).file = { filename: 'test.jpg' };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
    console.error = jest.fn(); // Mock console.error
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    console.error = originalConsoleError;
  });

  it('should handle ValidationError', () => {
    const error = new Error('Validation failed');
    error.name = 'ValidationError';

    errorMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: 'Validation failed'
    });
    expect(console.error).toHaveBeenCalled();
  });

  it('should handle ValidationErrorError', () => {
    const error = new Error('Another validation error');
    error.name = 'ValidationErrorError';

    errorMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: 'Another validation error'
    });
    expect(console.error).toHaveBeenCalled();
  });

  it('should handle unknown errors in development mode', () => {
    process.env.NODE_ENV = 'development';
    const error = new Error('Unknown error');
    error.stack = 'Error stack trace';

    errorMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: 'Internal server error',
      stack: 'Error stack trace'
    });
    expect(console.error).toHaveBeenCalled();
  });

  it('should handle unknown errors in production mode', () => {
    process.env.NODE_ENV = 'production';
    const error = new Error('Unknown error');
    error.stack = 'Error stack trace';

    errorMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: 'Internal server error',
      stack: undefined
    });
    expect(console.error).toHaveBeenCalled();
  });
});