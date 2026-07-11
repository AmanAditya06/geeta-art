import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export async function getSettings(_req: Request, res: Response) {
  try {
    const settings = await prisma.siteSetting.findMany();
    const obj: Record<string, string> = {};
    for (const s of settings) {
      obj[s.key] = s.value;
    }
    return res.json(obj);
  } catch (error) {
    console.error('Get settings error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function updateSettings(req: Request, res: Response) {
  try {
    const entries = req.body;
    if (typeof entries !== 'object' || Array.isArray(entries)) {
      return res.status(400).json({ message: 'Body must be a key-value object' });
    }

    for (const [key, value] of Object.entries(entries)) {
      if (typeof value !== 'string') continue;
      await prisma.siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }

    const settings = await prisma.siteSetting.findMany();
    const obj: Record<string, string> = {};
    for (const s of settings) {
      obj[s.key] = s.value;
    }
    return res.json(obj);
  } catch (error) {
    console.error('Update settings error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
