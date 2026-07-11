import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().optional(),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  comparePrice: z.number().positive().optional().nullable(),
  images: z.array(z.string()).optional(),
  stock: z.number().int().min(0).optional(),
  isFeatured: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  categoryId: z.string().min(1, 'Category ID is required'),
  variants: z.array(z.object({
    name: z.string().min(1),
    price: z.number().positive(),
    stock: z.number().int().min(0).optional(),
    sku: z.string().optional(),
  })).optional(),
});

export const productUpdateSchema = productSchema.partial();

export const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  image: z.string().optional(),
  parentId: z.string().optional(),
});

export const orderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1),
    variantId: z.string().optional(),
    quantity: z.number().int().positive(),
  })).min(1, 'At least one item is required'),
  shippingAddress: z.union([z.string(), z.object({})]),
  paymentMethod: z.string().optional(),
  paymentId: z.string().optional(),
});

export const cartAddSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional(),
  quantity: z.number().int().positive(),
});

export const cartUpdateSchema = z.object({
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

export const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export const bannerSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string().optional().nullable(),
  image: z.string().min(1, 'Image URL is required'),
  link: z.string().optional().nullable(),
  active: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});

export const profileUpdateSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  image: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).optional(),
});
