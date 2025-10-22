import mongoose, { Document, Model, Schema } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { BaseRepository } from '../base.repository';
import { PAGINATION_CONFIG } from '../../shared/constants/pagination';

// Create a test interface and schema
interface ITest extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const testSchema = new Schema<ITest>(
  {
    name: { type: String, required: true },
    status: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const TestModel = mongoose.model<ITest>('Test', testSchema);

describe('BaseRepository', () => {
  let mongoServer: MongoMemoryServer;
  let repository: BaseRepository<ITest>;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await TestModel.deleteMany({});
    repository = new BaseRepository<ITest>(TestModel, 'name');
  });

  describe('getPaginated', () => {
    beforeEach(async () => {
      // Create test documents
      await TestModel.create([
        { name: 'Test 1' },
        { name: 'Test 2' },
        { name: 'Test 3' },
        { name: 'Test 4' },
        { name: 'Test 5' },
      ]);
    });

    it('should return paginated results with default values', async () => {
      const result = await repository.getPaginated();

      expect(result.data).toHaveLength(5);
      expect(result.total).toBe(5);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(PAGINATION_CONFIG.DEFAULT_LIMIT);
      expect(result.totalPages).toBe(1);
    });

    it('should return correct page of results', async () => {
      const result = await repository.getPaginated(1, 2);

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(5);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(2);
      expect(result.totalPages).toBe(3);
    });

    it('should handle invalid page numbers', async () => {
      const result = await repository.getPaginated(-1, 2);

      expect(result.page).toBe(1);
      expect(result.data).toHaveLength(2);
    });

    it('should handle invalid limit numbers', async () => {
      const result = await repository.getPaginated(1, -1);

      expect(result.limit).toBe(1);
      expect(result.data).toHaveLength(1);
    });

    it('should respect maximum limit', async () => {
      const result = await repository.getPaginated(1, PAGINATION_CONFIG.MAX_LIMIT + 1);

      expect(result.limit).toBe(PAGINATION_CONFIG.MAX_LIMIT);
    });

    it('should apply filters correctly', async () => {
      const result = await repository.getPaginated(1, 10, { name: 'Test 1' });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.data[0].name).toBe('Test 1');
    });
  });

  describe('toggleStatus', () => {
    let testDoc: ITest;

    beforeEach(async () => {
      testDoc = await TestModel.create({ name: 'Test', status: true });
    });

    it('should toggle status from true to false', async () => {
      const result = await repository.toggleStatus(testDoc._id.toString());

      expect(result).toBeDefined();
      expect(result?.status).toBe(false);
    });

    it('should toggle status from false to true', async () => {
      // First toggle to false
      await repository.toggleStatus(testDoc._id.toString());
      
      // Then toggle back to true
      const result = await repository.toggleStatus(testDoc._id.toString());

      expect(result).toBeDefined();
      expect(result?.status).toBe(true);
    });

    it('should return null for invalid id', async () => {
      const result = await repository.toggleStatus('invalid-id');

      expect(result).toBeNull();
    });

    it('should return null for non-existent id', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const result = await repository.toggleStatus(nonExistentId);

      expect(result).toBeNull();
    });
  });

  describe('checkDuplicate', () => {
    beforeEach(async () => {
      await TestModel.create({ name: 'Existing Test' });
    });

    it('should return true for existing value', async () => {
      const result = await repository.checkDuplicate('name', 'Existing Test');

      expect(result).toBe(true);
    });

    it('should return false for non-existing value', async () => {
      const result = await repository.checkDuplicate('name', 'Non Existing Test');

      expect(result).toBe(false);
    });

    it('should be case insensitive', async () => {
      const result = await repository.checkDuplicate('name', 'eXisTing tEsT');

      expect(result).toBe(true);
    });

    it('should throw error for empty value', async () => {
      await expect(repository.checkDuplicate('name', '')).rejects.toThrow('name is required');
    });

    it('should exclude specified id when checking duplicates', async () => {
      const doc = await TestModel.create({ name: 'Another Test' });
      
      const result = await repository.checkDuplicate('name', 'Another Test', doc._id.toString());

      expect(result).toBe(false);
    });

    it('should handle invalid exclude id', async () => {
      const result = await repository.checkDuplicate('name', 'Existing Test', 'invalid-id');

      expect(result).toBe(true);
    });
  });
});