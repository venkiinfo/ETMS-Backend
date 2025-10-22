import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { FaqModel } from '../../models/faq.model';

describe('FAQ Model Test', () => {
  let mongoServer: MongoMemoryServer;

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
  });

  it('should create & save FAQ successfully', async () => {
    const validFaq = new FaqModel({
      question: 'Test Question',
      answer: 'Test Answer',
      status: true
    });
    const savedFaq = await validFaq.save();
    
    expect(savedFaq._id).toBeDefined();
    expect(savedFaq.question).toBe('Test Question');
    expect(savedFaq.answer).toBe('Test Answer');
    expect(savedFaq.status).toBe(true);
    expect(savedFaq.createdAt).toBeDefined();
    expect(savedFaq.updatedAt).toBeDefined();
  });

  it('should fail to save FAQ without required fields', async () => {
    const faqWithoutQuestion = new FaqModel({
      answer: 'Test Answer'
    });
    
    let err;
    try {
      await faqWithoutQuestion.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
  });

  it('should update FAQ successfully', async () => {
    const faq = new FaqModel({
      question: 'Original Question',
      answer: 'Original Answer',
      status: true
    });
    await faq.save();

    const updatedFaq = await FaqModel.findByIdAndUpdate(
      faq._id,
      { question: 'Updated Question' },
      { new: true }
    );

    expect(updatedFaq?.question).toBe('Updated Question');
    expect(updatedFaq?.answer).toBe('Original Answer');
  });

  it('should delete FAQ successfully', async () => {
    const faq = new FaqModel({
      question: 'To be deleted',
      answer: 'This will be deleted',
      status: true
    });
    await faq.save();

    await FaqModel.findByIdAndDelete(faq._id);
    const deletedFaq = await FaqModel.findById(faq._id);

    expect(deletedFaq).toBeNull();
  });

  it('should handle default status value', async () => {
    const faqWithoutStatus = new FaqModel({
      question: 'Test Question',
      answer: 'Test Answer'
    });
    const savedFaq = await faqWithoutStatus.save();

    expect(savedFaq.status).toBe(true); // Default value should be true
  });
});