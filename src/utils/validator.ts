export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export const validateFaq = (data: any) => {
  const errors = [];

  // Question validation
  if (!data.question) {
    errors.push('Question is required');
  } else if (typeof data.question !== 'string') {
    errors.push('Question must be a string');
  } else if (data.question.length < 5) {
    errors.push('Question must be at least 5 characters long');
  }

  // Answer validation
  if (!data.answer) {
    errors.push('Answer is required');
  } else if (typeof data.answer !== 'string') {
    errors.push('Answer must be a string');
  } else if (data.answer.length < 10) {
    errors.push('Answer must be at least 10 characters long');
  }

  // Status validation (optional field)
  if (data.status !== undefined && typeof data.status !== 'boolean') {
    errors.push('Status must be a boolean value');
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join(', '));
  }

  return true;
};