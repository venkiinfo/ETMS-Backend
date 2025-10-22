import { FaqService } from '../faq.service';
import { FaqRepository } from '../../repositories/faq.repository';
import { IFaq } from '../../models/faq.model';

jest.mock('../../repositories/faq.repository');

describe('FaqService', () => {
  let service: FaqService;
  let mockRepository: jest.Mocked<FaqRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRepository = new FaqRepository() as jest.Mocked<FaqRepository>;
    service = FaqService.getInstance();
    (service as any).faqRepository = mockRepository;
  });

  describe('create', () => {
    it('should create FAQ successfully when no duplicate exists', async () => {
      const faqData = {
        question: 'Test Question',
        answer: 'Test Answer',
      };

      // Mock checkDuplicate to return false (no duplicate)
      jest.spyOn(service as any, 'checkDuplicate').mockResolvedValue(false);

      // Mock repository create
      mockRepository.create.mockResolvedValue({
        ...faqData,
        _id: '123',
        status: true,
      } as unknown as IFaq);

      const result = await service.create(faqData);

      expect(mockRepository.create).toHaveBeenCalledWith(faqData);
      expect(result).toHaveProperty('_id', '123');
      expect(result).toHaveProperty('question', faqData.question);
    });

    it('should throw error when duplicate question exists', async () => {
      const faqData = {
        question: 'Test Question',
        answer: 'Test Answer',
      };

      // Mock checkDuplicate to return true (duplicate exists)
      jest.spyOn(service as any, 'checkDuplicate').mockResolvedValue(true);

      await expect(service.create(faqData)).rejects.toThrow(
        'A FAQ with this question already exists'
      );
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('getAll', () => {
    it('should get all FAQs with pagination', async () => {
      const mockFaqs = [
        { _id: '1', question: 'Q1', answer: 'A1' },
        { _id: '2', question: 'Q2', answer: 'A2' },
      ];

      mockRepository.getAll.mockResolvedValue({
        faqs: mockFaqs as unknown as IFaq[],
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1
      });

      const result = await service.getAll(1, 10);

      expect(mockRepository.getAll).toHaveBeenCalledWith(1, 10);
      expect(result.faqs).toHaveLength(2);
      expect(result.total).toBe(2);
    });
  });

  describe('getById', () => {
    it('should get FAQ by ID', async () => {
      const mockFaq = {
        _id: '123',
        question: 'Test',
        answer: 'Answer',
      } as unknown as IFaq;

      mockRepository.getById.mockResolvedValue(mockFaq);

      const result = await service.getById('123');

      expect(mockRepository.getById).toHaveBeenCalledWith('123');
      expect(result).toEqual(mockFaq);
    });

    it('should throw error when FAQ not found', async () => {
      mockRepository.getById.mockResolvedValue(null);

      await expect(service.getById('123')).rejects.toThrow('FAQ not found');
    });
  });

  describe('update', () => {
    it('should update FAQ successfully when no duplicate exists', async () => {
      const updateData = { question: 'Updated Question' };
      const mockUpdatedFaq = {
        _id: '123',
        ...updateData,
        answer: 'Original Answer',
      } as unknown as IFaq;

      // Mock checkDuplicate to return false (no duplicate)
      jest.spyOn(service as any, 'checkDuplicate').mockResolvedValue(false);

      mockRepository.updateById.mockResolvedValue(mockUpdatedFaq);

      const result = await service.update('123', updateData);

      expect(mockRepository.updateById).toHaveBeenCalledWith('123', updateData);
      expect(result).toEqual(mockUpdatedFaq);
    });

    it('should throw error when duplicate question exists', async () => {
      const updateData = { question: 'Duplicate Question' };

      // Mock checkDuplicate to return true (duplicate exists)
      jest.spyOn(service as any, 'checkDuplicate').mockResolvedValue(true);

      await expect(
        service.update('123', updateData)
      ).rejects.toThrow('A FAQ with this question already exists');
      expect(mockRepository.updateById).not.toHaveBeenCalled();
    });

    it('should throw error when FAQ not found for update', async () => {
      const updateData = { question: 'Test' };

      // Mock checkDuplicate to return false (no duplicate)
      jest.spyOn(service as any, 'checkDuplicate').mockResolvedValue(false);

      mockRepository.updateById.mockResolvedValue(null);

      await expect(
        service.update('123', updateData)
      ).rejects.toThrow('FAQ not found');
    });
  });

  describe('delete', () => {
    it('should delete FAQ successfully', async () => {
      const mockFaq = {
        _id: '123',
        question: 'Test',
        answer: 'Answer',
      } as unknown as IFaq;

      mockRepository.deleteById.mockResolvedValue(mockFaq);

      await service.delete('123');

      expect(mockRepository.deleteById).toHaveBeenCalledWith('123');
    });

    it('should throw error when FAQ not found for deletion', async () => {
      mockRepository.deleteById.mockResolvedValue(null);

      await expect(service.delete('123')).rejects.toThrow('FAQ not found');
    });
  });
});