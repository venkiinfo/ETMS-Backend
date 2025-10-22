import rateLimit from 'express-rate-limit';
import { ENV } from '../config/env';

export const rateLimiter = rateLimit({
  windowMs: ENV.rateLimit.windowMs,
  max: ENV.rateLimit.max,
  message: 'Too many requests from this IP, please try again later.',
});