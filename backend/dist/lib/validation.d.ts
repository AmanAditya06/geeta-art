import { z } from 'zod';
export declare const registerSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const productSchema: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    price: z.ZodNumber;
    comparePrice: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    images: z.ZodOptional<z.ZodArray<z.ZodString>>;
    stock: z.ZodOptional<z.ZodNumber>;
    isFeatured: z.ZodOptional<z.ZodBoolean>;
    isPublished: z.ZodOptional<z.ZodBoolean>;
    categoryId: z.ZodString;
    variants: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        price: z.ZodNumber;
        stock: z.ZodOptional<z.ZodNumber>;
        sku: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const productUpdateSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    slug: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    price: z.ZodOptional<z.ZodNumber>;
    comparePrice: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodNumber>>>;
    images: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    stock: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    isFeatured: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
    isPublished: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
    categoryId: z.ZodOptional<z.ZodString>;
    variants: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        price: z.ZodNumber;
        stock: z.ZodOptional<z.ZodNumber>;
        sku: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>>;
}, z.core.$strip>;
export declare const categorySchema: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    image: z.ZodOptional<z.ZodString>;
    parentId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const orderSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        productId: z.ZodString;
        variantId: z.ZodOptional<z.ZodString>;
        quantity: z.ZodNumber;
    }, z.core.$strip>>;
    shippingAddress: z.ZodUnion<readonly [z.ZodString, z.ZodObject<{}, z.core.$strip>]>;
    paymentMethod: z.ZodOptional<z.ZodString>;
    paymentId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const cartAddSchema: z.ZodObject<{
    productId: z.ZodString;
    variantId: z.ZodOptional<z.ZodString>;
    quantity: z.ZodNumber;
}, z.core.$strip>;
export declare const cartUpdateSchema: z.ZodObject<{
    quantity: z.ZodNumber;
}, z.core.$strip>;
export declare const reviewSchema: z.ZodObject<{
    productId: z.ZodString;
    rating: z.ZodNumber;
    comment: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const bannerSchema: z.ZodObject<{
    title: z.ZodString;
    subtitle: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    image: z.ZodString;
    link: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    active: z.ZodOptional<z.ZodBoolean>;
    order: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const profileUpdateSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    image: z.ZodOptional<z.ZodString>;
    currentPassword: z.ZodOptional<z.ZodString>;
    newPassword: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
