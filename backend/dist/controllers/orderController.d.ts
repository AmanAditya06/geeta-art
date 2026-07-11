import { Request, Response } from 'express';
export declare function createOrder(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function listUserOrders(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function listAllOrders(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function updateOrderStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function verifyPayment(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
