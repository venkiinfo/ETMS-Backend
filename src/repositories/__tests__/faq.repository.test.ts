import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { FaqRepository } from '../faq.repository';
import { FaqModel } from '../../models/faq.model';

describe('FAQ Repository', () => {
  let mongoServer: MongoMemoryServer;
  let repository: FaqRepository;

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
    await FaqModel.deleteMany({});
    repository = new FaqRepository();
  });

  describe('create', () => {
    it('should create a new FAQ', async () => {
      const faqData = {
        question: 'Test Question',
        answer: 'This is a detailed test answer that meets the minimum length requirement.',
      };

      const createdFaq = await repository.create(faqData);

      expect(createdFaq).toBeDefined();
      expect(createdFaq.question).toBe(faqData.question);
      expect(createdFaq.answer).toBe(faqData.answer);
      expect(createdFaq.status).toBe(true); // default value
    });

    it('should sanitize HTML in answer', async () => {
      const faqData = {
        question: 'Test Question',
        answer: '<p>Test Answer</p><script>alert("xss")</script>',
      };

      const createdFaq = await repository.create(faqData);

      expect(createdFaq.answer).toBe('<p>Test Answer</p>');
    });

    it('should throw error for invalid data', async () => {
      const invalidFaq = {
        question: '', // empty question
        answer: 'Test Answer',
      };

      await expect(repository.create(invalidFaq)).rejects.toThrow();
    });
  });

  describe('getAll', () => {
    beforeEach(async () => {
      const faqs = [
        { question: 'Q1', answer: 'A1' },
        { question: 'Q2', answer: 'A2' },
        { question: 'Q3', answer: 'A3' },
      ];
      await FaqModel.insertMany(faqs);
    });

    it('should return paginated FAQs', async () => {
      const result = await repository.getAll(1, 2);

      expect(result.faqs).toHaveLength(2);
      expect(result.total).toBe(3);
    });

    it('should return all FAQs when no pagination is specified', async () => {
      const result = await repository.getAll();

      expect(result.faqs).toHaveLength(3);
      expect(result.total).toBe(3);
    });
  });

  describe('getById', () => {
    let testFaq: any;

    beforeEach(async () => {
      testFaq = await FaqModel.create({
        question: 'Test Question',
        answer: 'Test Answer',
      });
    });

    it('should return FAQ by valid ID', async () => {
      const faq = await repository.getById(testFaq._id.toString());

      expect(faq).toBeDefined();
      expect(faq?.question).toBe(testFaq.question);
    });

    it('should return null for invalid ID format', async () => {
      const faq = await repository.getById('invalid-id');
      expect(faq).toBeNull();
    });

    it('should return null for non-existent ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const faq = await repository.getById(nonExistentId);
      expect(faq).toBeNull();
    });
  });

  describe('updateById', () => {
    let testFaq: any;

    beforeEach(async () => {
      testFaq = await FaqModel.create({
        question: 'Original Question',
        answer: 'Original Answer',
      });
    });

    it('should update FAQ with valid data', async () => {
      const updateData = {
        question: 'Updated Question',
        answer: 'This is an updated test answer that meets the minimum length requirement.',
      };

      const updatedFaq = await repository.updateById(
        testFaq._id.toString(),
        updateData
      );

      expect(updatedFaq?.question).toBe(updateData.question);
      expect(updatedFaq?.answer).toBe(updateData.answer);
    });

    it('should sanitize HTML in updated answer', async () => {
      const updateData = {
        answer: '<p>Safe HTML</p><script>alert("xss")</script>',
      };

      const updatedFaq = await repository.updateById(
        testFaq._id.toString(),
        updateData
      );

      expect(updatedFaq?.answer).toBe('<p>Safe HTML</p>');
    });

    it('should return null for invalid ID', async () => {
      const updatedFaq = await repository.updateById('invalid-id', {
        question: 'Updated',
      });
      expect(updatedFaq).toBeNull();
    });
  });

  describe('deleteById', () => {
    let testFaq: any;

    beforeEach(async () => {
      testFaq = await FaqModel.create({
        question: 'To Be Deleted',
        answer: 'Delete Me',
      });
    });

    it('should delete FAQ by ID', async () => {
      const deletedFaq = await repository.deleteById(testFaq._id.toString());
      expect(deletedFaq?.question).toBe(testFaq.question);

      const faqInDb = await FaqModel.findById(testFaq._id);
      expect(faqInDb).toBeNull();
    });

    it('should return null for invalid ID', async () => {
      const result = await repository.deleteById('invalid-id');
      expect(result).toBeNull();
    });
  });
});