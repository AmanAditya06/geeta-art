import { Request, Response } from 'express';
export declare function listCategories(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getCategoryBySlug(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
