import { Request, Response } from 'express';
import { FaqService } from '../services/faq.service';

export class FaqController {
  private static faqService = FaqService.getInstance();

  static async createFaq(req: Request, res: Response) {
    try {
      const faq = await FaqController.faqService.create(req.body);
      res.status(201).json({ success: true, data: faq });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  static async getAllFaqs(req: Request, res: Response) {
    try {
      const page = Number.parseInt(req.query.page as string) || 1;
      const limit = Number.parseInt(req.query.limit as string) || 10;
      
      const { faqs, total } = await FaqController.faqService.getAll(page, limit);
      
      res.status(200).json({
        success: true,
        data: faqs,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async getFaqById(req: Request, res: Response) {
    try {
      const faq = await FaqController.faqService.getById(req.params.id);
      res.status(200).json({ success: true, data: faq });
    } catch (error) {
      if (error instanceof Error && error.message === 'FAQ not found') {
        res.status(404).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  static async updateFaq(req: Request, res: Response) {
    try {
      const faq = await FaqController.faqService.update(req.params.id, req.body);
      res.status(200).json({ success: true, data: faq });
    } catch (error) {
      if (error instanceof Error && error.message === 'FAQ not found') {
        res.status(404).json({ success: false, message: error.message });
      } else if (error instanceof Error) {
        res.status(400).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  static async deleteFaq(req: Request, res: Response) {
    try {
      await FaqController.faqService.delete(req.params.id);
      res.status(200).json({ success: true, message: 'FAQ deleted successfully' });
    } catch (error) {
      if (error instanceof Error && error.message === 'FAQ not found') {
        res.status(404).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  static async toggleFaqStatus(req: Request, res: Response) {
    try {
      const faq = await FaqController.faqService.toggleStatus(req.params.id);
      res.status(200).json({ success: true, data: faq });
    } catch (error) {
      if (error instanceof Error && error.message === 'FAQ not found') {
        res.status(404).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  static async checkDuplicateFaq(req: Request, res: Response) {
    try {
      const { question, excludeId } = req.body;
      const exists = await FaqController.faqService.checkDuplicate('question', question, excludeId);
      res.status(200).json({ success: true, exists });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }
}