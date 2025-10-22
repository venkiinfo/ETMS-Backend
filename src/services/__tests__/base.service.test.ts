import { Document } from 'mongoose';
import { BaseService } from '../base.service';
import { IBaseRepository } from '../../repositories/base.repository';

// Create mock interfaces
interface ITest extends Document {
  name: string;
  status: boolean;
}

describe('BaseService', () => {
  let service: BaseService<ITest>;
  let mockRepository: jest.Mocked<IBaseRepository<ITest>>;

  beforeEach(() => {
    // Create mock repository
    mockRepository = {
      toggleStatus: jest.fn(),
      checkDuplicate: jest.fn(),
      getPaginated: jest.fn(),
    };

    // Create service instance
    service = new BaseService(mockRepository, 'Test');
  });

  describe('toggleStatus', () => {
    it('should toggle status successfully', async () => {
      const mockDoc = {
        _id: 'test-id',
        name: 'Test',
        status: true,
      } as ITest;

      mockRepository.toggleStatus.mockResolvedValue(mockDoc);

      const result = await service.toggleStatus('test-id');

      expect(result).toBe(mockDoc);
      expect(mockRepository.toggleStatus).toHaveBeenCalledWith('test-id');
    });

    it('should throw error when document not found', async () => {
      mockRepository.toggleStatus.mockResolvedValue(null);

      await expect(service.toggleStatus('test-id')).rejects.toThrow('Test not found');
      expect(mockRepository.toggleStatus).toHaveBeenCalledWith('test-id');
    });
  });

  describe('checkDuplicate', () => {
    it('should return true for duplicate value', async () => {
      mockRepository.checkDuplicate.mockResolvedValue(true);

      const result = await service.checkDuplicate('name', 'Test Value');

      expect(result).toBe(true);
      expect(mockRepository.checkDuplicate).toHaveBeenCalledWith('name', 'Test Value', undefined);
    });

    it('should return false for non-duplicate value', async () => {
      mockRepository.checkDuplicate.mockResolvedValue(false);

      const result = await service.checkDuplicate('name', 'Unique Value');

      expect(result).toBe(false);
      expect(mockRepository.checkDuplicate).toHaveBeenCalledWith('name', 'Unique Value', undefined);
    });

    it('should handle exclude id parameter', async () => {
      mockRepository.checkDuplicate.mockResolvedValue(false);

      const result = await service.checkDuplicate('name', 'Test Value', 'test-id');

      expect(result).toBe(false);
      expect(mockRepository.checkDuplicate).toHaveBeenCalledWith('name', 'Test Value', 'test-id');
    });

    it('should throw error for empty value', async () => {
      await expect(service.checkDuplicate('name', '')).rejects.toThrow('name is required');
      expect(mockRepository.checkDuplicate).not.toHaveBeenCalled();
    });

    it('should throw error for whitespace-only value', async () => {
      await expect(service.checkDuplicate('name', '   ')).rejects.toThrow('name is required');
      expect(mockRepository.checkDuplicate).not.toHaveBeenCalled();
    });
  });
});