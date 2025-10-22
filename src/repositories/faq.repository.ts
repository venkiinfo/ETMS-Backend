import mongoose from 'mongoose';
import { FaqModel, IFaq } from '../models/faq.model';
import { cleanHtml } from '../utils/sanitizeHtml';
import { validateFaq } from '../utils/validator';
import { BaseRepository } from './base.repository';

export class FaqRepository extends BaseRepository<IFaq> {
  constructor() {
    super(FaqModel, 'question');
  }

  async create(data: Partial<IFaq>): Promise<IFaq> {
    validateFaq(data);
    const sanitizedAnswer = data.answer ? cleanHtml(data.answer) : '';
    return await FaqModel.create({ ...data, answer: sanitizedAnswer });
  }

  async getAll(page?: number, limit?: number, filter: Record<string, any> = {}) {
    const result = await this.getPaginated(page, limit, filter);
    return {
      faqs: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages
    };
  }

  async getById(id: string): Promise<IFaq | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await FaqModel.findById(id);
  }

  async updateById(id: string, data: Partial<IFaq>): Promise<IFaq | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }

    if (Object.keys(data).length > 0) {
      validateFaq({ ...data, question: data.question || 'placeholder', answer: data.answer || 'placeholder' });
    }

    const sanitizedAnswer = data.answer ? cleanHtml(data.answer) : undefined;
    return await FaqModel.findByIdAndUpdate(
      id,
      { ...data, answer: sanitizedAnswer },
      { new: true }
    );
  }

  async deleteById(id: string): Promise<IFaq | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await FaqModel.findByIdAndDelete(id);
  }
}