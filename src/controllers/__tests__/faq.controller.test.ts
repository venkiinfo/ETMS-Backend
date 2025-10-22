import { Request, Response } from 'express';
import { FaqController } from '../faq.controller';
import { FaqService } from '../../services/faq.service';
import { IFaq } from '../../models/faq.model';

// Mock the FaqService
jest.mock('../../services/faq.service', () => ({
  FaqService: {
    getInstance: jest.fn()
  }
}));

describe('FaqController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObj: any = {};
  let mockFaqService: jest.Mocked<FaqService>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockImplementation((result) => {
        responseObj = result;
      }),
    };

    // Create mock service instance
    mockFaqService = {
      create: jest.fn(),
      getAll: jest.fn(),
      getById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      toggleStatus: jest.fn(),
      checkDuplicate: jest.fn(),
      repository: {},
    } as any;

    // Replace the static instance
    Object.defineProperty(FaqController, 'faqService', {
      get: () => mockFaqService,
    });

    // Set up getInstance mock
    (FaqService.getInstance as jest.Mock).mockReturnValue(mockFaqService);

    // Reset responseObj
    responseObj = {};
  });

  describe('createFaq', () => {
    it('should create FAQ successfully', async () => {
      const faqData = {
        question: 'Test Question',
        answer: 'Test Answer',
      };
      mockRequest.body = faqData;

      const mockCreatedFaq = {
        ...faqData,
        _id: '123',
        status: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as IFaq;

      mockFaqService.create.mockResolvedValue(mockCreatedFaq);

      await FaqController.createFaq(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(responseObj.success).toBe(true);
      expect(responseObj.data).toHaveProperty('question', faqData.question);
      expect(mockFaqService.create).toHaveBeenCalledWith(faqData);
    });

    it('should handle validation errors', async () => {
      mockRequest.body = { question: '' };

      mockFaqService.create.mockRejectedValue(
        new Error('Validation error')
      );

      await FaqController.createFaq(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObj.success).toBe(false);
      expect(mockFaqService.create).toHaveBeenCalledWith(mockRequest.body);
    });
  });

  describe('getAllFaqs', () => {
    it('should return paginated FAQs', async () => {
      mockRequest.query = { page: '1', limit: '10' };

      const mockFaqs = [
        {
          _id: '1',
          question: 'Q1',
          answer: 'A1',
          status: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: '2',
          question: 'Q2',
          answer: 'A2',
          status: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ] as unknown as IFaq[];

      mockFaqService.getAll.mockResolvedValue({
        faqs: mockFaqs,
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1
      });

      await FaqController.getAllFaqs(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObj.data).toHaveLength(2);
      expect(responseObj.meta).toHaveProperty('totalPages', 1);
      expect(mockFaqService.getAll).toHaveBeenCalledWith(1, 10);
    });
  });

  describe('getFaqById', () => {
    it('should return FAQ by ID', async () => {
      mockRequest.params = { id: '123' };

      const mockFaq = {
        _id: '123',
        question: 'Test',
        answer: 'Answer',
        status: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as IFaq;

      mockFaqService.getById.mockResolvedValue(mockFaq);

      await FaqController.getFaqById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObj.data).toEqual(mockFaq);
      expect(mockFaqService.getById).toHaveBeenCalledWith('123');
    });

    it('should handle not found error', async () => {
      mockRequest.params = { id: 'nonexistent' };

      mockFaqService.getById.mockRejectedValue(
        new Error('FAQ not found')
      );

      await FaqController.getFaqById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseObj.success).toBe(false);
      expect(mockFaqService.getById).toHaveBeenCalledWith('nonexistent');
    });
  });

  describe('updateFaq', () => {
    it('should update FAQ successfully', async () => {
      mockRequest.params = { id: '123' };
      mockRequest.body = { question: 'Updated Question' };

      const mockUpdatedFaq = {
        _id: '123',
        question: 'Updated Question',
        answer: 'Original Answer',
        status: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as IFaq;

      mockFaqService.update.mockResolvedValue(mockUpdatedFaq);

      await FaqController.updateFaq(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObj.data).toEqual(mockUpdatedFaq);
      expect(mockFaqService.update).toHaveBeenCalledWith('123', { question: 'Updated Question' });
    });

    it('should handle not found error', async () => {
      mockRequest.params = { id: 'nonexistent' };
      mockRequest.body = { question: 'Updated Question' };

      mockFaqService.update.mockRejectedValue(new Error('FAQ not found'));

      await FaqController.updateFaq(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseObj.success).toBe(false);
      expect(responseObj.message).toBe('FAQ not found');
    });

    it('should handle validation errors', async () => {
      mockRequest.params = { id: '123' };
      mockRequest.body = { question: '' };

      mockFaqService.update.mockRejectedValue(new Error('Invalid question'));

      await FaqController.updateFaq(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObj.success).toBe(false);
      expect(responseObj.message).toBe('Invalid question');
    });

    it('should handle unknown errors', async () => {
      mockRequest.params = { id: '123' };
      mockRequest.body = { question: 'Updated Question' };

      mockFaqService.update.mockRejectedValue('Unknown error');

      await FaqController.updateFaq(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(responseObj.success).toBe(false);
      expect(responseObj.message).toBe('Internal server error');
    });
  });

  describe('deleteFaq', () => {
    it('should delete FAQ successfully', async () => {
      mockRequest.params = { id: '123' };

      const mockDeletedFaq = {
        _id: '123',
        question: 'Test',
        answer: 'Answer',
        status: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as IFaq;

      mockFaqService.delete.mockResolvedValue(mockDeletedFaq);

      await FaqController.deleteFaq(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObj.success).toBe(true);
      expect(responseObj.message).toBe('FAQ deleted successfully');
      expect(mockFaqService.delete).toHaveBeenCalledWith('123');
    });

    it('should handle not found error', async () => {
      mockRequest.params = { id: 'nonexistent' };

      mockFaqService.delete.mockRejectedValue(new Error('FAQ not found'));

      await FaqController.deleteFaq(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseObj.success).toBe(false);
      expect(responseObj.message).toBe('FAQ not found');
    });

    it('should handle unknown errors', async () => {
      mockRequest.params = { id: '123' };

      mockFaqService.delete.mockRejectedValue('Unknown error');

      await FaqController.deleteFaq(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(responseObj.success).toBe(false);
      expect(responseObj.message).toBe('Internal server error');
    });
  });

  describe('toggleFaqStatus', () => {
    it('should toggle FAQ status successfully', async () => {
      mockRequest.params = { id: '123' };

      const mockToggledFaq = {
        _id: '123',
        question: 'Test',
        answer: 'Answer',
        status: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as IFaq;

      mockFaqService.toggleStatus.mockResolvedValue(mockToggledFaq);

      await FaqController.toggleFaqStatus(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObj.success).toBe(true);
      expect(responseObj.data).toEqual(mockToggledFaq);
    });

    it('should handle not found error', async () => {
      mockRequest.params = { id: 'nonexistent' };

      mockFaqService.toggleStatus.mockRejectedValue(new Error('FAQ not found'));

      await FaqController.toggleFaqStatus(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseObj.success).toBe(false);
      expect(responseObj.message).toBe('FAQ not found');
    });

    it('should handle unknown errors', async () => {
      mockRequest.params = { id: '123' };

      mockFaqService.toggleStatus.mockRejectedValue('Unknown error');

      await FaqController.toggleFaqStatus(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(responseObj.success).toBe(false);
      expect(responseObj.message).toBe('Internal server error');
    });
  });

  describe('checkDuplicateFaq', () => {
    it('should check for duplicates successfully', async () => {
      mockRequest.body = {
        question: 'Test Question',
        excludeId: '123'
      };

      mockFaqService.checkDuplicate.mockResolvedValue(false);

      await FaqController.checkDuplicateFaq(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObj.success).toBe(true);
      expect(responseObj.exists).toBe(false);
      expect(mockFaqService.checkDuplicate).toHaveBeenCalledWith('question', 'Test Question', '123');
    });

    it('should handle validation error', async () => {
      mockRequest.body = { question: '' };

      mockFaqService.checkDuplicate.mockRejectedValue(new Error('Invalid input'));

      await FaqController.checkDuplicateFaq(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObj.success).toBe(false);
      expect(responseObj.message).toBe('Invalid input');
    });

    it('should handle unknown errors', async () => {
      mockRequest.body = {
        question: 'Test Question'
      };

      mockFaqService.checkDuplicate.mockRejectedValue('Unknown error');

      await FaqController.checkDuplicateFaq(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(responseObj.success).toBe(false);
      expect(responseObj.message).toBe('Internal server error');
    });
  });
});