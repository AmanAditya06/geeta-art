import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
type ValidationSchemas = {
    body?: z.ZodSchema;
    query?: z.ZodSchema;
    params?: z.ZodSchema;
};
export declare function validate(schemas: ValidationSchemas): (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export {};
