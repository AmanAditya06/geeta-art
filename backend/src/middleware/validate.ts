import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

type ValidationSchemas = {
  body?: z.ZodSchema;
  query?: z.ZodSchema;
  params?: z.ZodSchema;
};

export function validate(schemas: ValidationSchemas) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query) as any;
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as any;
      }
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
        return res.status(400).json({ message: messages.join('; ') });
      }
      return res.status(400).json({ message: 'Validation failed' });
    }
  };
}
