"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWishlist = getWishlist;
exports.addToWishlist = addToWishlist;
exports.removeFromWishlist = removeFromWishlist;
const prisma_1 = require("../lib/prisma");
async function getWishlist(req, res) {
    try {
        const userId = req.user.id;
        const items = await prisma_1.prisma.wishlistItem.findMany({
            where: { userId },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        price: true,
                        comparePrice: true,
                        images: true,
                        stock: true,
                        isPublished: true,
                        reviews: { select: { rating: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        const itemsWithRating = items.map((item) => {
            const ratings = item.product.reviews.map((r) => r.rating);
            const avgRating = ratings.length > 0
                ? ratings.reduce((a, b) => a + b, 0) / ratings.length
                : null;
            const { reviews, ...product } = item.product;
            return { ...item, product: { ...product, avgRating, reviewCount: ratings.length } };
        });
        return res.json(itemsWithRating);
    }
    catch (error) {
        console.error('Get wishlist error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
async function addToWishlist(req, res) {
    try {
        const userId = req.user.id;
        const { productId } = req.body;
        if (!productId) {
            return res.status(400).json({ message: 'ProductId is required' });
        }
        const product = await prisma_1.prisma.product.findUnique({ where: { id: productId } });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        const existing = await prisma_1.prisma.wishlistItem.findUnique({
            where: { userId_productId: { userId, productId } },
        });
        if (existing) {
            return res.json(existing);
        }
        const item = await prisma_1.prisma.wishlistItem.create({
            data: { userId, productId },
            include: {
                product: {
                    select: { id: true, name: true, slug: true, price: true, images: true },
                },
            },
        });
        return res.status(201).json(item);
    }
    catch (error) {
        console.error('Add to wishlist error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
async function removeFromWishlist(req, res) {
    try {
        const userId = req.user.id;
        const productId = req.params.productId;
        const existing = await prisma_1.prisma.wishlistItem.findUnique({
            where: { userId_productId: { userId, productId } },
        });
        if (!existing) {
            return res.status(404).json({ message: 'Wishlist item not found' });
        }
        await prisma_1.prisma.wishlistItem.delete({
            where: { userId_productId: { userId, productId } },
        });
        return res.json({ message: 'Item removed from wishlist' });
    }
    catch (error) {
        console.error('Remove from wishlist error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
//# sourceMappingURL=wishlistController.js.map