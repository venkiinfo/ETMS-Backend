import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { FaqModel } from '../faq.model';

describe('FAQ Model Test Suite', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await FaqModel.deleteMany({});
  });

  it('should create a FAQ successfully', async () => {
    const validFaq = {
      question: 'Test Question',
      answer: 'Test Answer',
      status: true
    };

    const savedFaq = await FaqModel.create(validFaq);
    expect(savedFaq._id).toBeDefined();
    expect(savedFaq.question).toBe(validFaq.question);
    expect(savedFaq.answer).toBe(validFaq.answer);
    expect(savedFaq.status).toBe(validFaq.status);
  });

  it('should fail to create FAQ without required fields', async () => {
    const faqWithoutRequired = {};
    
    await expect(FaqModel.create(faqWithoutRequired)).rejects.toThrow();
  });

  it('should update FAQ successfully', async () => {
    const faq = await FaqModel.create({
      question: 'Initial Question',
      answer: 'Initial Answer',
      status: true
    });

    const updatedQuestion = 'Updated Question';
    faq.question = updatedQuestion;
    await faq.save();

    const updatedFaq = await FaqModel.findById(faq._id);
    expect(updatedFaq?.question).toBe(updatedQuestion);
  });

  it('should delete FAQ successfully', async () => {
    const faq = await FaqModel.create({
      question: 'Test Question',
      answer: 'Test Answer',
      status: true
    });

    await FaqModel.deleteOne({ _id: faq._id });
    const deletedFaq = await FaqModel.findById(faq._id);
    expect(deletedFaq).toBeNull();
  });
});