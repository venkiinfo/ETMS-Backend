import { cleanHtml } from '../../utils/sanitizeHtml';
import { validateFaq } from '../../utils/validator';
import { normalizePath } from '../../utils/normalizePath';
import catchAsync from '../../utils/catchAsync';
import { Request, Response, NextFunction } from 'express';

describe('Utils Tests', () => {
  describe('sanitizeHtml', () => {
    it('should clean HTML from dangerous tags', () => {
      const dirtyHtml = '<p>Hello</p><script>alert("xss")</script>';
      const cleanedHtml = cleanHtml(dirtyHtml);
      expect(cleanedHtml).toBe('<p>Hello</p>');
    });

    it('should handle empty input', () => {
      expect(cleanHtml('')).toBe('');
    });

    it('should preserve safe HTML', () => {
      const safeHtml = '<p>Hello <strong>World</strong></p>';
      expect(cleanHtml(safeHtml)).toBe(safeHtml);
    });
  });

  describe('validator', () => {
    it('should validate valid FAQ data', () => {
      const validFaq = {
        question: 'Valid Question Here?',
        answer: 'This is a valid answer with enough characters.',
        status: true
      };
      
      expect(() => validateFaq(validFaq)).not.toThrow();
    });

    it('should reject FAQ with missing question', () => {
      const invalidFaq = {
        answer: 'This is a valid answer with enough characters.'
      };
      
      expect(() => validateFaq(invalidFaq)).toThrow('Question is required');
    });

    it('should reject FAQ with non-string question', () => {
      const invalidFaq = {
        question: 123,
        answer: 'This is a valid answer with enough characters.'
      };
      
      expect(() => validateFaq(invalidFaq)).toThrow('Question must be a string');
    });

    it('should reject FAQ with short question', () => {
      const invalidFaq = {
        question: 'Hi?',
        answer: 'This is a valid answer with enough characters.',
      };
      
      expect(() => validateFaq(invalidFaq)).toThrow('Question must be at least 5 characters long');
    });

    it('should reject FAQ with missing answer', () => {
      const invalidFaq = {
        question: 'This is a valid question?'
      };
      
      expect(() => validateFaq(invalidFaq)).toThrow('Answer is required');
    });

    it('should reject FAQ with non-string answer', () => {
      const invalidFaq = {
        question: 'This is a valid question?',
        answer: 123
      };
      
      expect(() => validateFaq(invalidFaq)).toThrow('Answer must be a string');
    });

    it('should reject FAQ with short answer', () => {
      const invalidFaq = {
        question: 'This is a valid question?',
        answer: 'Too short',
      };
      
      expect(() => validateFaq(invalidFaq)).toThrow('Answer must be at least 10 characters long');
    });

    it('should reject FAQ with invalid status type', () => {
      const invalidFaq = {
        question: 'This is a valid question?',
        answer: 'This is a valid answer with enough characters.',
        status: 'not-a-boolean'
      };
      
      expect(() => validateFaq(invalidFaq)).toThrow('Status must be a boolean value');
    });

    it('should validate FAQ without status field', () => {
      const validFaq = {
        question: 'Valid Question Here?',
        answer: 'This is a valid answer with enough characters.'
      };
      
      expect(() => validateFaq(validFaq)).not.toThrow();
    });
  });

  describe('normalizePath', () => {
    it('should normalize path with double slashes', () => {
      const path = '/api//v1///faq';
      expect(normalizePath(path)).toBe('/api/v1/faq');
    });

    it('should handle path with trailing slash', () => {
      const path = '/api/v1/faq/';
      expect(normalizePath(path)).toBe('/api/v1/faq');
    });

    it('should handle empty path', () => {
      expect(normalizePath('')).toBe('/');
    });
  });

  describe('catchAsync', () => {
    it('should handle successful async function', async () => {
      const mockReq = {} as Request;
      const mockRes = {
        json: jest.fn()
      } as unknown as Response;
      const mockNext = jest.fn() as NextFunction;

      const successFunction = async () => ({ data: 'success' });
      const wrappedFunction = catchAsync(successFunction);

      await wrappedFunction(mockReq, mockRes, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should catch errors and pass to next', async () => {
      const mockReq = {} as Request;
      const mockRes = {} as Response;
      const mockNext = jest.fn() as NextFunction;

      const errorFunction = async () => {
        throw new Error('Test error');
      };
      const wrappedFunction = catchAsync(errorFunction);

      await wrappedFunction(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});