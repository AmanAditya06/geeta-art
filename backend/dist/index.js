"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const authController = __importStar(require("./controllers/authController"));
const productController = __importStar(require("./controllers/productController"));
const categoryController = __importStar(require("./controllers/categoryController"));
const orderController = __importStar(require("./controllers/orderController"));
const cartController = __importStar(require("./controllers/cartController"));
const userController = __importStar(require("./controllers/userController"));
const uploadController = __importStar(require("./controllers/uploadController"));
const bannerController = __importStar(require("./controllers/bannerController"));
const wishlistController = __importStar(require("./controllers/wishlistController"));
const reviewController = __importStar(require("./controllers/reviewController"));
const settingsController = __importStar(require("./controllers/settingsController"));
const auth_1 = require("./middleware/auth");
const validate_1 = require("./middleware/validate");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const validation_1 = require("./lib/validation");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',');
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { message: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.post('/api/auth/register', authLimiter, (0, validate_1.validate)({ body: validation_1.registerSchema }), authController.register);
app.post('/api/auth/login', authLimiter, (0, validate_1.validate)({ body: validation_1.loginSchema }), authController.login);
app.get('/api/auth/me', auth_1.requireAuth, authController.getProfile);
app.get('/api/products', productController.listProducts);
app.get('/api/products/:slug', productController.getProductBySlug);
app.post('/api/products', auth_1.requireAuth, auth_1.requireAdmin, (0, validate_1.validate)({ body: validation_1.productSchema }), productController.createProduct);
app.put('/api/products/:id', auth_1.requireAuth, auth_1.requireAdmin, (0, validate_1.validate)({ body: validation_1.productUpdateSchema }), productController.updateProduct);
app.delete('/api/products/:id', auth_1.requireAuth, auth_1.requireAdmin, productController.deleteProduct);
app.get('/api/categories', categoryController.listCategories);
app.get('/api/categories/:slug', categoryController.getCategoryBySlug);
app.post('/api/orders', auth_1.requireAuth, (0, validate_1.validate)({ body: validation_1.orderSchema }), orderController.createOrder);
app.get('/api/orders', auth_1.requireAuth, orderController.listUserOrders);
app.get('/api/admin/orders', auth_1.requireAuth, auth_1.requireAdmin, orderController.listAllOrders);
app.put('/api/orders/:id/status', auth_1.requireAuth, auth_1.requireAdmin, orderController.updateOrderStatus);
app.post('/api/orders/:id/pay', auth_1.requireAuth, orderController.verifyPayment);
app.get('/api/cart', auth_1.requireAuth, cartController.getCart);
app.post('/api/cart', auth_1.requireAuth, (0, validate_1.validate)({ body: validation_1.cartAddSchema }), cartController.addToCart);
app.put('/api/cart/:id', auth_1.requireAuth, (0, validate_1.validate)({ body: validation_1.cartUpdateSchema }), cartController.updateCartItem);
app.delete('/api/cart/:productId', auth_1.requireAuth, cartController.removeCartItem);
app.get('/api/users', auth_1.requireAuth, auth_1.requireAdmin, userController.listUsers);
app.put('/api/users/profile', auth_1.requireAuth, (0, validate_1.validate)({ body: validation_1.profileUpdateSchema }), userController.updateProfile);
app.post('/api/upload', auth_1.requireAuth, auth_1.requireAdmin, uploadController.upload.single('image'), uploadController.uploadImage);
app.get('/api/banners', bannerController.listBanners);
app.post('/api/banners', auth_1.requireAuth, auth_1.requireAdmin, (0, validate_1.validate)({ body: validation_1.bannerSchema }), bannerController.createBanner);
app.put('/api/banners/:id', auth_1.requireAuth, auth_1.requireAdmin, (0, validate_1.validate)({ body: validation_1.bannerSchema.partial() }), bannerController.updateBanner);
app.delete('/api/banners/:id', auth_1.requireAuth, auth_1.requireAdmin, bannerController.deleteBanner);
app.get('/api/wishlist', auth_1.requireAuth, wishlistController.getWishlist);
app.post('/api/wishlist', auth_1.requireAuth, wishlistController.addToWishlist);
app.delete('/api/wishlist/:productId', auth_1.requireAuth, wishlistController.removeFromWishlist);
app.get('/api/reviews/:productId', reviewController.getProductReviews);
app.post('/api/reviews', auth_1.requireAuth, (0, validate_1.validate)({ body: validation_1.reviewSchema }), reviewController.createReview);
app.get('/api/settings', settingsController.getSettings);
app.put('/api/settings', auth_1.requireAuth, auth_1.requireAdmin, settingsController.updateSettings);
app.use((err, _req, res, _next) => {
    console.error('Unhandled error:', err);
    if (err instanceof SyntaxError && 'body' in err) {
        return res.status(400).json({ message: 'Invalid JSON in request body' });
    }
    if (err.message && err.message.includes('Invalid file type')) {
        return res.status(400).json({ message: err.message });
    }
    if (err.message && err.message.includes('File too large')) {
        return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
    }
    return res.status(500).json({ message: 'Internal server error' });
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map