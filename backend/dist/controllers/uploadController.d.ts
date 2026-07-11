import { Request, Response } from 'express';
import multer from 'multer';
export declare const upload: multer.Multer;
export declare function uploadImage(req: Request, res: Response): Response<any, Record<string, any>>;
