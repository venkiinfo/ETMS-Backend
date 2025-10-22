import { Document } from 'mongoose';
import { IBaseRepository } from '../repositories/base.repository';

export class BaseService<T extends Document> {
  constructor(
    protected repository: IBaseRepository<T>,
    protected entityName: string
  ) {}

  async toggleStatus(id: string) {
    const document = await this.repository.toggleStatus(id);
    if (!document) {
      throw new Error(`${this.entityName} not found`);
    }
    return document;
  }

  async checkDuplicate(field: string, value: string, excludeId?: string) {
    if (!value || value.trim().length === 0) {
      throw new Error(`${field} is required`);
    }
    return await this.repository.checkDuplicate(field, value, excludeId);
  }
}