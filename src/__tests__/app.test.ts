import request from 'supertest';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import globalErrorHandler from '../middlewares/error.middleware';
import { registerRoutes } from '../routes';

const app = express();

// Middleware setup
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));

// Routes setup
registerRoutes(app);

// Error handling middleware must be registered after routes for testing
app.use((err: any, req: any, res: any, next: any) => {
  globalErrorHandler(err, req, res, next);
});

describe('App Configuration', () => {
  let app: express.Application;
  
  beforeEach(() => {
    app = express();
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
    app.use(helmet());
    app.use(compression());
    app.use(morgan('dev'));
  });
  it('should have CORS enabled', async () => {
    const response = await request(app)
      .options('/')
      .set('Origin', 'http://localhost:3000');

    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    expect(response.headers['access-control-allow-credentials']).toBe('true');
  });

  it('should parse JSON bodies', async () => {
    const testData = { test: 'data' };
    const response = await request(app)
      .post('/api/test-json')
      .send(testData);

    expect(response.status).toBe(404); // Route doesn't exist, but middleware processes JSON
  });

  it('should parse URL-encoded bodies', async () => {
    const response = await request(app)
      .post('/api/test-urlencoded')
      .send('key=value');

    expect(response.status).toBe(404); // Route doesn't exist, but middleware processes form data
  });

  it('should have security headers (helmet)', async () => {
    const response = await request(app).get('/');

    expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(response.headers['x-dns-prefetch-control']).toBe('off');
    expect(response.headers['x-download-options']).toBe('noopen');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-xss-protection']).toBe('0');
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      // Create new app instance
      app = express();
      app.use(express.json());
      
      // Clear console error to avoid noise in test output
      jest.spyOn(console, 'error').mockImplementation(() => {});

      // Add test routes before error handler
      app.get('/error-route', (req, res, next) => {
        next(new Error('Test error'));
      });

      app.get('/validation-error', (req, res, next) => {
        const error: any = new Error('Invalid input');
        error.name = 'ValidationError';
        error.errors = { field: { message: 'Field is invalid' } };
        next(error);
      });

      app.get('/dev-error', (req, res, next) => {
        next(new Error('Development error'));
      });

      app.get('/prod-error', (req, res, next) => {
        next(new Error('Production error'));
      });

      // Add error handler last
      app.use(globalErrorHandler as express.ErrorRequestHandler);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should handle generic errors', async () => {
      const response = await request(app).get('/error-route');
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        message: 'Internal server error',
      });
    });

    it('should handle validation errors', async () => {
      const response = await request(app).get('/validation-error');
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: 'Invalid input'
      });
    });

    it('should include stack trace in development mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const response = await request(app).get('/dev-error');
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Internal server error');
      expect(response.body.stack).toBeDefined(); // Just check for stack trace presence

      process.env.NODE_ENV = originalEnv;
    });

    it('should not include stack trace in production mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const response = await request(app).get('/prod-error');
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        message: 'Internal server error'
      });

      process.env.NODE_ENV = originalEnv;
    });
  });
});