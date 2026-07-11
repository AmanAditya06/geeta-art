import { Request, Response } from 'express';
export declare function getProductReviews(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function createReview(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
