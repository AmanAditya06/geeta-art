import { Request, Response } from 'express';
export declare function listBanners(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function createBanner(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function updateBanner(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function deleteBanner(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
