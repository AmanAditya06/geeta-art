"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSettings = getSettings;
exports.updateSettings = updateSettings;
const prisma_1 = require("../lib/prisma");
async function getSettings(_req, res) {
    try {
        const settings = await prisma_1.prisma.siteSetting.findMany();
        const obj = {};
        for (const s of settings) {
            obj[s.key] = s.value;
        }
        return res.json(obj);
    }
    catch (error) {
        console.error('Get settings error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
async function updateSettings(req, res) {
    try {
        const entries = req.body;
        if (typeof entries !== 'object' || Array.isArray(entries)) {
            return res.status(400).json({ message: 'Body must be a key-value object' });
        }
        for (const [key, value] of Object.entries(entries)) {
            if (typeof value !== 'string')
                continue;
            await prisma_1.prisma.siteSetting.upsert({
                where: { key },
                update: { value },
                create: { key, value },
            });
        }
        const settings = await prisma_1.prisma.siteSetting.findMany();
        const obj = {};
        for (const s of settings) {
            obj[s.key] = s.value;
        }
        return res.json(obj);
    }
    catch (error) {
        console.error('Update settings error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
//# sourceMappingURL=settingsController.js.map