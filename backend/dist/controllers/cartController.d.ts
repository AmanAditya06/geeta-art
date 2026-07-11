import { Request, Response } from 'express';
export declare function getCart(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function addToCart(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function updateCartItem(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function removeCartItem(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
