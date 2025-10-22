import type { Request, Response, NextFunction } from 'express';

const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Skip if headers already sent
  if (res.headersSent) {
    return next(err);
  }

  // Log error for debugging
  console.error('[Error]:', err);

  try {
    // Handle validation errors
    if (err?.name === 'ValidationError' || err?.name === 'ValidationErrorError') {
      return res.status(400).json({
        success: false,
        message: err.message || 'Invalid input'
      });
    }

    const response = {
      success: false,
      message: 'Internal server error'
    };

    if (process.env.NODE_ENV === 'development') {
      Object.assign(response, { stack: err.stack });
    }

    return res.status(500).json(response);
  } catch (error) {
    // Fallback error response
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

export default globalErrorHandler;