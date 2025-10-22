import { Request, Response, NextFunction } from 'express';

const normalizeValue = (value: any): any => {
  if (typeof value === 'string') {
    return value.trim();
  } else if (typeof value === 'object' && value !== null) {
    return normalizeObject(value);
  }
  return value;
};

const normalizeObject = (obj: any): any => {
  const normalized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    normalized[key] = normalizeValue(value);
  }
  return normalized;
};

export const normalizeDataTypes = (req: Request, res: Response, next: NextFunction): void => {
  if (req.body && typeof req.body === 'object') {
    req.body = normalizeObject(req.body);
  }
  next();
};