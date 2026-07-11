"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCart = getCart;
exports.addToCart = addToCart;
exports.updateCartItem = updateCartItem;
exports.removeCartItem = removeCartItem;
const prisma_1 = require("../lib/prisma");
async function getCart(req, res) {
    try {
        const userId = req.user.id;
        const cartItems = await prisma_1.prisma.cartItem.findMany({
            where: { userId },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        price: true,
                        images: true,
                        stock: true,
                        isPublished: true,
                    },
                },
                variant: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        const total = cartItems.reduce((sum, item) => {
            const price = item.variant ? item.variant.price : item.product.price;
            return sum + price * item.quantity;
        }, 0);
        return res.json({ items: cartItems, total });
    }
    catch (error) {
        console.error('Get cart error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
async function addToCart(req, res) {
    try {
        const userId = req.user.id;
        const { productId, variantId, quantity } = req.body;
        if (!productId || !quantity) {
            return res.status(400).json({ message: 'ProductId and quantity are required' });
        }
        const product = await prisma_1.prisma.product.findUnique({ where: { id: productId } });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        if (variantId) {
            const variant = await prisma_1.prisma.productVariant.findUnique({ where: { id: variantId } });
            if (!variant || variant.productId !== productId) {
                return res.status(404).json({ message: 'Variant not found' });
            }
        }
        const existing = await prisma_1.prisma.cartItem.findFirst({
            where: { userId, productId, variantId: variantId || null },
        });
        if (existing) {
            const updated = await prisma_1.prisma.cartItem.update({
                where: { id: existing.id },
                data: { quantity: existing.quantity + quantity },
                include: {
                    product: {
                        select: { id: true, name: true, slug: true, price: true, images: true },
                    },
                    variant: true,
                },
            });
            return res.json(updated);
        }
        const cartItem = await prisma_1.prisma.cartItem.create({
            data: {
                userId,
                productId,
                variantId: variantId || null,
                quantity,
            },
            include: {
                product: {
                    select: { id: true, name: true, slug: true, price: true, images: true },
                },
                variant: true,
            },
        });
        return res.status(201).json(cartItem);
    }
    catch (error) {
        console.error('Add to cart error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
async function updateCartItem(req, res) {
    try {
        const userId = req.user.id;
        const id = req.params.id;
        const { quantity } = req.body;
        if (!quantity || quantity < 1) {
            return res.status(400).json({ message: 'Quantity must be at least 1' });
        }
        const cartItem = await prisma_1.prisma.cartItem.findFirst({
            where: { id, userId },
        });
        if (!cartItem) {
            return res.status(404).json({ message: 'Cart item not found' });
        }
        const updated = await prisma_1.prisma.cartItem.update({
            where: { id },
            data: { quantity },
            include: {
                product: {
                    select: { id: true, name: true, slug: true, price: true, images: true },
                },
                variant: true,
            },
        });
        return res.json(updated);
    }
    catch (error) {
        console.error('Update cart item error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
async function removeCartItem(req, res) {
    try {
        const userId = req.user.id;
        const productId = req.params.productId;
        const cartItem = await prisma_1.prisma.cartItem.findFirst({
            where: { userId, productId },
        });
        if (!cartItem) {
            return res.status(404).json({ message: 'Cart item not found' });
        }
        await prisma_1.prisma.cartItem.delete({ where: { id: cartItem.id } });
        return res.json({ message: 'Item removed from cart' });
    }
    catch (error) {
        console.error('Remove cart item error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
//# sourceMappingURL=cartController.js.map