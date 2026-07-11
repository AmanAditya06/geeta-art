import { Request, Response } from 'express';
export declare function getWishlist(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function addToWishlist(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function removeFromWishlist(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
