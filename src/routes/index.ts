import { Express } from 'express';
import faqRoutes from './faq.routes';

const BASE_URL = '/api/v1';

export const registerRoutes = (app: Express): void => {
  // FAQ Routes
  app.use(`${BASE_URL}/faqs`, faqRoutes);
};