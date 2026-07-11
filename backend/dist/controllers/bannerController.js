"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listBanners = listBanners;
exports.createBanner = createBanner;
exports.updateBanner = updateBanner;
exports.deleteBanner = deleteBanner;
const prisma_1 = require("../lib/prisma");
async function listBanners(req, res) {
    try {
        const banners = await prisma_1.prisma.banner.findMany({
            where: { active: true },
            orderBy: { order: 'asc' },
        });
        return res.json(banners);
    }
    catch (error) {
        console.error('List banners error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
async function createBanner(req, res) {
    try {
        const { title, subtitle, image, link, active, order } = req.body;
        if (!title || !image) {
            return res.status(400).json({ message: 'Title and image are required' });
        }
        const banner = await prisma_1.prisma.banner.create({
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
    }
    catch (error) {
        console.error('Create banner error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
async function updateBanner(req, res) {
    try {
        const id = req.params.id;
        const { title, subtitle, image, link, active, order } = req.body;
        const existing = await prisma_1.prisma.banner.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ message: 'Banner not found' });
        }
        const data = {};
        if (title !== undefined)
            data.title = title;
        if (subtitle !== undefined)
            data.subtitle = subtitle;
        if (image !== undefined)
            data.image = image;
        if (link !== undefined)
            data.link = link;
        if (active !== undefined)
            data.active = active;
        if (order !== undefined)
            data.order = order;
        const banner = await prisma_1.prisma.banner.update({
            where: { id },
            data,
        });
        return res.json(banner);
    }
    catch (error) {
        console.error('Update banner error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
async function deleteBanner(req, res) {
    try {
        const id = req.params.id;
        const existing = await prisma_1.prisma.banner.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ message: 'Banner not found' });
        }
        await prisma_1.prisma.banner.delete({ where: { id } });
        return res.json({ message: 'Banner deleted successfully' });
    }
    catch (error) {
        console.error('Delete banner error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
//# sourceMappingURL=bannerController.js.map