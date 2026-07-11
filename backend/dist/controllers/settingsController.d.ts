import { Request, Response } from 'express';
export declare function getSettings(_req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function updateSettings(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
