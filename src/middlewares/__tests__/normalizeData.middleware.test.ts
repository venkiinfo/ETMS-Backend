import { Request, Response, NextFunction } from 'express';
import { normalizeDataTypes } from '../normalizeData.middleware';

describe('normalizeDataTypes Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {}
    };
    mockResponse = {};
    mockNext = jest.fn();
  });

  it('should trim string values in body', () => {
    mockRequest.body = {
      name: '  John Doe  ',
      email: ' test@example.com ',
      nested: {
        field: '  nested value  '
      }
    };

    normalizeDataTypes(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockRequest.body).toEqual({
      name: 'John Doe',
      email: 'test@example.com',
      nested: {
        field: 'nested value'
      }
    });
    expect(mockNext).toHaveBeenCalled();
  });

  it('should handle non-string values', () => {
    mockRequest.body = {
      number: 123,
      boolean: true,
      null: null,
      undefined: undefined,
      nested: {
        string: '  nested  ',
        number: 456
      }
    };

    normalizeDataTypes(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockRequest.body).toEqual({
      number: 123,
      boolean: true,
      null: null,
      undefined: undefined,
      nested: {
        string: 'nested',
        number: 456
      }
    });
    expect(mockNext).toHaveBeenCalled();
  });

  it('should handle null or undefined body', () => {
    mockRequest.body = null;

    normalizeDataTypes(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockRequest.body).toBeNull();
    expect(mockNext).toHaveBeenCalled();
  });

  it('should handle empty object body', () => {
    mockRequest.body = {};

    normalizeDataTypes(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockRequest.body).toEqual({});
    expect(mockNext).toHaveBeenCalled();
  });
});