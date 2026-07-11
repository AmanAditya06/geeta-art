"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileUpdateSchema = exports.bannerSchema = exports.reviewSchema = exports.cartUpdateSchema = exports.cartAddSchema = exports.orderSchema = exports.categorySchema = exports.productUpdateSchema = exports.productSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
exports.productSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required'),
    slug: zod_1.z.string().min(1, 'Slug is required'),
    description: zod_1.z.string().optional(),
    price: zod_1.z.number().positive('Price must be positive'),
    comparePrice: zod_1.z.number().positive().optional().nullable(),
    images: zod_1.z.array(zod_1.z.string()).optional(),
    stock: zod_1.z.number().int().min(0).optional(),
    isFeatured: zod_1.z.boolean().optional(),
    isPublished: zod_1.z.boolean().optional(),
    categoryId: zod_1.z.string().min(1, 'Category ID is required'),
    variants: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string().min(1),
        price: zod_1.z.number().positive(),
        stock: zod_1.z.number().int().min(0).optional(),
        sku: zod_1.z.string().optional(),
    })).optional(),
});
exports.productUpdateSchema = exports.productSchema.partial();
exports.categorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required'),
    slug: zod_1.z.string().min(1, 'Slug is required'),
    description: zod_1.z.string().optional(),
    image: zod_1.z.string().optional(),
    parentId: zod_1.z.string().optional(),
});
exports.orderSchema = zod_1.z.object({
    items: zod_1.z.array(zod_1.z.object({
        productId: zod_1.z.string().min(1),
        variantId: zod_1.z.string().optional(),
        quantity: zod_1.z.number().int().positive(),
    })).min(1, 'At least one item is required'),
    shippingAddress: zod_1.z.union([zod_1.z.string(), zod_1.z.object({})]),
    paymentMethod: zod_1.z.string().optional(),
    paymentId: zod_1.z.string().optional(),
});
exports.cartAddSchema = zod_1.z.object({
    productId: zod_1.z.string().min(1),
    variantId: zod_1.z.string().optional(),
    quantity: zod_1.z.number().int().positive(),
});
exports.cartUpdateSchema = zod_1.z.object({
    quantity: zod_1.z.number().int().min(1, 'Quantity must be at least 1'),
});
exports.reviewSchema = zod_1.z.object({
    productId: zod_1.z.string().min(1),
    rating: zod_1.z.number().int().min(1).max(5),
    comment: zod_1.z.string().optional(),
});
exports.bannerSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required'),
    subtitle: zod_1.z.string().optional().nullable(),
    image: zod_1.z.string().min(1, 'Image URL is required'),
    link: zod_1.z.string().optional().nullable(),
    active: zod_1.z.boolean().optional(),
    order: zod_1.z.number().int().min(0).optional(),
});
exports.profileUpdateSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    phone: zod_1.z.string().optional(),
    image: zod_1.z.string().optional(),
    currentPassword: zod_1.z.string().optional(),
    newPassword: zod_1.z.string().min(6).optional(),
});
//# sourceMappingURL=validation.js.map