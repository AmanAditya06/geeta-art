"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listProducts = listProducts;
exports.getProductBySlug = getProductBySlug;
exports.createProduct = createProduct;
exports.updateProduct = updateProduct;
exports.deleteProduct = deleteProduct;
const prisma_1 = require("../lib/prisma");
function parseImages(product) {
    if (typeof product.images === 'string') {
        try {
            product.images = JSON.parse(product.images);
        }
        catch {
            product.images = [];
        }
    }
    return product;
}
async function listProducts(req, res) {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 12));
        const skip = (page - 1) * limit;
        const categoryId = req.query.categoryId;
        const categorySlug = req.query.category;
        const search = req.query.search;
        const sort = req.query.sort || 'createdAt:desc';
        const featured = req.query.featured;
        const admin = req.query.admin;
        const minPrice = parseFloat(req.query.minPrice);
        const maxPrice = parseFloat(req.query.maxPrice);
        const where = {};
        if (admin !== 'true') {
            where.isPublished = true;
        }
        if (categoryId) {
            where.categoryId = categoryId;
        }
        else if (categorySlug) {
            where.category = { slug: categorySlug };
        }
        if (search) {
            where.OR = [
                { name: { contains: search } },
                { description: { contains: search } },
            ];
        }
        if (featured === 'true') {
            where.isFeatured = true;
        }
        if (!isNaN(minPrice) || !isNaN(maxPrice)) {
            where.price = {};
            if (!isNaN(minPrice))
                where.price.gte = minPrice;
            if (!isNaN(maxPrice))
                where.price.lte = maxPrice;
        }
        const sortMap = {
            'newest': 'createdAt',
            'price-asc': 'price',
            'price-desc': 'price',
        };
        let orderBy = { createdAt: 'desc' };
        if (sort) {
            const mappedSort = sortMap[sort];
            if (mappedSort) {
                const dir = sort === 'price-asc' ? 'asc' : 'desc';
                orderBy = { [mappedSort]: dir };
            }
            else {
                const parts = sort.split(':');
                const field = parts[0];
                const dir = parts[1] === 'asc' ? 'asc' : 'desc';
                const validFields = ['price', 'name', 'createdAt', 'updatedAt'];
                if (validFields.includes(field)) {
                    orderBy = { [field]: dir };
                }
            }
        }
        const [products, total] = await Promise.all([
            prisma_1.prisma.product.findMany({
                where,
                include: {
                    category: true,
                    variants: true,
                    reviews: { select: { rating: true } },
                },
                orderBy,
                skip,
                take: limit,
            }),
            prisma_1.prisma.product.count({ where }),
        ]);
        const productsWithRating = products.map((product) => {
            const ratings = product.reviews.map((r) => r.rating);
            const avgRating = ratings.length > 0
                ? ratings.reduce((a, b) => a + b, 0) / ratings.length
                : null;
            const reviewCount = ratings.length;
            const { reviews, ...rest } = product;
            return { ...parseImages(rest), avgRating, reviewCount };
        });
        return res.json({
            products: productsWithRating,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        console.error('List products error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
async function getProductBySlug(req, res) {
    try {
        const slug = req.params.slug;
        const product = await prisma_1.prisma.product.findUnique({
            where: { slug },
            include: {
                category: true,
                variants: true,
                reviews: {
                    include: {
                        user: {
                            select: { id: true, name: true, image: true },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        const ratings = product.reviews.map((r) => r.rating);
        const avgRating = ratings.length > 0
            ? ratings.reduce((a, b) => a + b, 0) / ratings.length
            : null;
        return res.json({
            ...parseImages(product),
            avgRating,
            reviewCount: ratings.length,
        });
    }
    catch (error) {
        console.error('Get product error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
async function createProduct(req, res) {
    try {
        const { name, slug, description, price, comparePrice, images, stock, isFeatured, isPublished, categoryId, variants } = req.body;
        if (!name || !slug || price === undefined || !categoryId) {
            return res.status(400).json({ message: 'Name, slug, price, and categoryId are required' });
        }
        const existingSlug = await prisma_1.prisma.product.findUnique({ where: { slug } });
        if (existingSlug) {
            return res.status(409).json({ message: 'A product with this slug already exists' });
        }
        const product = await prisma_1.prisma.product.create({
            data: {
                name,
                slug,
                description,
                price: Number(price),
                comparePrice: comparePrice ? Number(comparePrice) : null,
                images: images ? JSON.stringify(images) : "[]",
                stock: stock || 0,
                isFeatured: isFeatured || false,
                isPublished: isPublished !== undefined ? isPublished : true,
                category: { connect: { id: categoryId } },
                variants: variants && variants.length > 0 ? {
                    create: variants.map((v) => ({
                        name: v.name,
                        price: Number(v.price),
                        stock: v.stock || 0,
                        sku: v.sku,
                    })),
                } : undefined,
            },
            include: {
                category: true,
                variants: true,
            },
        });
        return res.status(201).json(product);
    }
    catch (error) {
        console.error('Create product error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
async function updateProduct(req, res) {
    try {
        const id = req.params.id;
        const { name, slug, description, price, comparePrice, images, stock, isFeatured, isPublished, categoryId, variants } = req.body;
        const existing = await prisma_1.prisma.product.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ message: 'Product not found' });
        }
        if (slug && slug !== existing.slug) {
            const slugConflict = await prisma_1.prisma.product.findUnique({ where: { slug } });
            if (slugConflict) {
                return res.status(409).json({ message: 'A product with this slug already exists' });
            }
        }
        const data = {};
        if (name !== undefined)
            data.name = name;
        if (slug !== undefined)
            data.slug = slug;
        if (description !== undefined)
            data.description = description;
        if (price !== undefined)
            data.price = Number(price);
        if (comparePrice !== undefined)
            data.comparePrice = comparePrice ? Number(comparePrice) : null;
        if (images !== undefined)
            data.images = JSON.stringify(images);
        if (stock !== undefined)
            data.stock = stock;
        if (isFeatured !== undefined)
            data.isFeatured = isFeatured;
        if (isPublished !== undefined)
            data.isPublished = isPublished;
        if (categoryId !== undefined)
            data.category = { connect: { id: categoryId } };
        if (variants !== undefined) {
            await prisma_1.prisma.productVariant.deleteMany({ where: { productId: id } });
            if (variants.length > 0) {
                data.variants = {
                    create: variants.map((v) => ({
                        name: v.name,
                        price: Number(v.price),
                        stock: v.stock || 0,
                        sku: v.sku,
                    })),
                };
            }
        }
        const product = await prisma_1.prisma.product.update({
            where: { id },
            data,
            include: {
                category: true,
                variants: true,
            },
        });
        return res.json(product);
    }
    catch (error) {
        console.error('Update product error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
async function deleteProduct(req, res) {
    try {
        const id = req.params.id;
        const existing = await prisma_1.prisma.product.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ message: 'Product not found' });
        }
        await prisma_1.prisma.product.delete({ where: { id } });
        return res.json({ message: 'Product deleted successfully' });
    }
    catch (error) {
        console.error('Delete product error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
//# sourceMappingURL=productController.js.map