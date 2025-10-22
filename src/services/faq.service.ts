import { IFaq } from '../models/faq.model';
import { BaseService } from './base.service';
import { FaqRepository } from '../repositories/faq.repository';

export class FaqService extends BaseService<IFaq> {
  private static instance: FaqService;
  private faqRepository: FaqRepository;

  private constructor() {
    const repository = new FaqRepository();
    super(repository, 'FAQ');
    this.faqRepository = repository;
  }

  static getInstance(): FaqService {
    if (!FaqService.instance) {
      FaqService.instance = new FaqService();
    }
    return FaqService.instance;
  }

  async create(data: Partial<IFaq>) {
    // Check for duplicate before creating
    if (data.question) {
      const isDuplicate = await this.checkDuplicate('question', data.question);
      if (isDuplicate) {
        throw new Error('A FAQ with this question already exists');
      }
    }
    return await this.faqRepository.create(data);
  }

  async getAll(page: number = 1, limit: number = 10) {
    return await this.faqRepository.getAll(page, limit);
  }

  async getById(id: string) {
    const faq = await this.faqRepository.getById(id);
    if (!faq) {
      throw new Error('FAQ not found');
    }
    return faq;
  }

  async update(id: string, data: Partial<IFaq>) {
    // Check for duplicate before updating, excluding the current FAQ
    if (data.question) {
      const isDuplicate = await this.checkDuplicate('question', data.question, id);
      if (isDuplicate) {
        throw new Error('A FAQ with this question already exists');
      }
    }
    const faq = await this.faqRepository.updateById(id, data);
    if (!faq) {
      throw new Error('FAQ not found');
    }
    return faq;
  }

  async delete(id: string) {
    const faq = await this.faqRepository.deleteById(id);
    if (!faq) {
      throw new Error('FAQ not found');
    }
    return faq;
  }
}