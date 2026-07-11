"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUsers = listUsers;
exports.updateProfile = updateProfile;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../lib/prisma");
async function listUsers(req, res) {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
        const skip = (page - 1) * limit;
        const [users, total] = await Promise.all([
            prisma_1.prisma.user.findMany({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    image: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true,
                    _count: { select: { orders: true, reviews: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma_1.prisma.user.count(),
        ]);
        return res.json({
            users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        console.error('List users error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
async function updateProfile(req, res) {
    try {
        const userId = req.user.id;
        const { name, phone, image, currentPassword, newPassword } = req.body;
        const data = {};
        if (name !== undefined)
            data.name = name;
        if (phone !== undefined)
            data.phone = phone;
        if (image !== undefined)
            data.image = image;
        if (newPassword) {
            const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
            if (!user || !user.password) {
                return res.status(400).json({ message: 'Cannot change password for this account' });
            }
            if (!currentPassword) {
                return res.status(400).json({ message: 'Current password is required to set a new password' });
            }
            const isValid = await bcryptjs_1.default.compare(currentPassword, user.password);
            if (!isValid) {
                return res.status(401).json({ message: 'Current password is incorrect' });
            }
            data.password = await bcryptjs_1.default.hash(newPassword, 12);
        }
        const user = await prisma_1.prisma.user.update({
            where: { id: userId },
            data,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                image: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return res.json(user);
    }
    catch (error) {
        console.error('Update profile error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
//# sourceMappingURL=userController.js.map