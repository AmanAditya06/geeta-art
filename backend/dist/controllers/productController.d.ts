import { Request, Response } from 'express';
export declare function listProducts(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getProductBySlug(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function createProduct(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function updateProduct(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function deleteProduct(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
