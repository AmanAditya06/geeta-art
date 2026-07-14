import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export async function listAddresses(req: Request, res: Response) {
  try {
    const userId = req.user!.id;

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return res.json(addresses);
  } catch (error) {
    console.error('List addresses error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function createAddress(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { name, phone, street, city, state, pincode, isDefault } = req.body;

    if (!name || !phone || !street || !city || !state || !pincode) {
      return res.status(400).json({ message: 'All address fields are required' });
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId,
        name,
        phone,
        street,
        city,
        state,
        pincode,
        isDefault: isDefault || false,
      },
    });

    return res.status(201).json(address);
  } catch (error) {
    console.error('Create address error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function updateAddress(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;
    const { name, phone, street, city, state, pincode, isDefault } = req.body;

    const existing = await prisma.address.findFirst({ where: { id, userId } });
    if (!existing) {
      return res.status(404).json({ message: 'Address not found' });
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(street !== undefined ? { street } : {}),
        ...(city !== undefined ? { city } : {}),
        ...(state !== undefined ? { state } : {}),
        ...(pincode !== undefined ? { pincode } : {}),
        ...(isDefault !== undefined ? { isDefault } : {}),
      },
    });

    return res.json(address);
  } catch (error) {
    console.error('Update address error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function deleteAddress(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;

    const existing = await prisma.address.findFirst({ where: { id, userId } });
    if (!existing) {
      return res.status(404).json({ message: 'Address not found' });
    }

    await prisma.address.delete({ where: { id } });

    return res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Delete address error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
