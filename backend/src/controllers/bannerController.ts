import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export async function listBanners(req: Request, res: Response) {
  try {
    const banners = await prisma.banner.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    });

    return res.json(banners);
  } catch (error) {
    console.error('List banners error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function createBanner(req: Request, res: Response) {
  try {
    const { title, subtitle, image, link, active, order } = req.body;

    if (!title || !image) {
      return res.status(400).json({ message: 'Title and image are required' });
    }

    const banner = await prisma.banner.create({
      data: {
        title,
        subtitle: subtitle || null,
        image,
        link: link || null,
        active: active !== undefined ? active : true,
        order: order || 0,
      },
    });

    return res.status(201).json(banner);
  } catch (error) {
    console.error('Create banner error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function updateBanner(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const { title, subtitle, image, link, active, order } = req.body;

    const existing = await prisma.banner.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    const data: Record<string, unknown> = {};
    if (title !== undefined) data.title = title;
    if (subtitle !== undefined) data.subtitle = subtitle;
    if (image !== undefined) data.image = image;
    if (link !== undefined) data.link = link;
    if (active !== undefined) data.active = active;
    if (order !== undefined) data.order = order;

    const banner = await prisma.banner.update({
      where: { id },
      data,
    });

    return res.json(banner);
  } catch (error) {
    console.error('Update banner error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function deleteBanner(req: Request, res: Response) {
  try {
    const id = req.params.id as string;

    const existing = await prisma.banner.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    await prisma.banner.delete({ where: { id } });

    return res.json({ message: 'Banner deleted successfully' });
  } catch (error) {
    console.error('Delete banner error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
