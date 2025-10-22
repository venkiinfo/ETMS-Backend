import mongoose, { Document, Model } from 'mongoose';
import { PAGINATION_CONFIG } from '../shared/constants/pagination';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IBaseRepository<T extends Document> {
  toggleStatus(id: string): Promise<T | null>;
  checkDuplicate(field: string, value: string, excludeId?: string): Promise<boolean>;
  getPaginated(page?: number, limit?: number, filter?: Record<string, any>): Promise<PaginatedResponse<T>>;
}

export class BaseRepository<T extends Document> implements IBaseRepository<T> {
  constructor(
    private readonly model: Model<T>,
    private readonly uniqueField: string
  ) {}

  async getPaginated(
    page: number = PAGINATION_CONFIG.DEFAULT_PAGE,
    limit: number = PAGINATION_CONFIG.DEFAULT_LIMIT,
    filter: Record<string, any> = {}
  ): Promise<PaginatedResponse<T>> {
    // Ensure valid pagination parameters
    const validatedPage = Math.max(1, page);
    const validatedLimit = Math.min(PAGINATION_CONFIG.MAX_LIMIT, Math.max(1, limit));
    const skip = (validatedPage - 1) * validatedLimit;

    const [data, total] = await Promise.all([
      this.model
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(validatedLimit),
      this.model.countDocuments(filter)
    ]);

    return {
      data,
      total,
      page: validatedPage,
      limit: validatedLimit,
      totalPages: Math.ceil(total / validatedLimit)
    };
  }

  async toggleStatus(id: string): Promise<T | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }

    const document = await this.model.findById(id);
    if (!document) {
      return null;
    }

    // Assuming all models have a status field
    const currentStatus = (document as any).status;
    (document as any).status = !currentStatus;
    return await document.save();
  }

  async checkDuplicate(field: string, value: string, excludeId?: string): Promise<boolean> {
    if (!value || value.trim().length === 0) {
      throw new Error(`${field} is required`);
    }

    const query: any = {
      [field]: { $regex: new RegExp(`^${value.trim()}$`, 'i') }
    };

    if (excludeId && mongoose.Types.ObjectId.isValid(excludeId)) {
      query._id = { $ne: new mongoose.Types.ObjectId(excludeId) };
    }

    const existingDoc = await this.model.findOne(query);
    return !!existingDoc;
  }
}