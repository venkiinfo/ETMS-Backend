import express, { ErrorRequestHandler } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import globalErrorHandler from './middlewares/error.middleware';
import { registerRoutes } from './routes';

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
// app.use(rateLimiter);

// Register all routes
registerRoutes(app);

// Error handling middleware must be the last middleware to catch all errors
app.use(globalErrorHandler as ErrorRequestHandler);

export default app;