import request from 'supertest';
import { agent } from 'supertest';
import express, { Express, Request, Response } from 'express';
import { registerRoutes } from '../routes';

jest.mock('../routes/faq.routes', () => {
  const mockRouter = express.Router();
  mockRouter.get('/', (req: Request, res: Response) => {
    res.json({ success: true });
  });
  mockRouter.post('/', (req: Request, res: Response) => {
    const { question } = req.body;
    if (!question || question.trim() === '') {
      const error: any = new Error('Invalid input');
      error.name = 'ValidationError';
      throw error;
    }
    res.json({ success: true });
  });
  return { __esModule: true, default: mockRouter };
});

describe('Routes', () => {
  let app: Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    registerRoutes(app);

    // Add error handling middleware
    app.use((err: any, req: Request, res: Response, next: Function) => {
      if (err.name === 'ValidationError') {
        res.status(400).json({ 
          success: false,
          message: err.message || 'Validation error'
        });
        return;
      }
      next(err);
    });
  });

  it('should register FAQ routes at correct base path', async () => {
    const response = await agent(app).get('/api/v1/faqs');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true });
  });

  it('should return 404 for non-existent routes', async () => {
    const response = await agent(app).get('/api/v1/non-existent');
    expect(response.status).toBe(404);
  });

  it('should accept JSON request bodies', async () => {
    const payload = { test: 'data' };
    const response = await agent(app)
      .post('/api/v1/faqs')
      .send(payload)
      .set('Content-Type', 'application/json');
    
    expect(response.status).not.toBe(415); // Not unsupported media type
  });

  it('should handle URL-encoded request bodies', async () => {
    const response = await agent(app)
      .post('/api/v1/faqs')
      .send('test=data')
      .set('Content-Type', 'application/x-www-form-urlencoded');
    
    expect(response.status).not.toBe(415); // Not unsupported media type
  });

  describe('Error Handling', () => {
    it('should handle 404 for unknown routes', async () => {
      const response = await request(app).get('/api/non-existent');
      
      expect(response.status).toBe(404);
    });

    it('should handle validation errors', async () => {
      const invalidData = {
        question: '', // Empty question should fail validation
        answer: 'Test Answer'
      };

      const response = await request(app)
        .post('/api/v1/faqs')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });
  });
});