require('dotenv').config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';

import * as authController from './controllers/authController';
import * as productController from './controllers/productController';
import * as categoryController from './controllers/categoryController';
import * as orderController from './controllers/orderController';
import * as cartController from './controllers/cartController';
import * as userController from './controllers/userController';
import * as uploadController from './controllers/uploadController';
import * as bannerController from './controllers/bannerController';
import * as wishlistController from './controllers/wishlistController';
import * as reviewController from './controllers/reviewController';
import * as settingsController from './controllers/settingsController';
import * as addressController from './controllers/addressController';
import { requireAuth, requireAdmin } from './middleware/auth';
import { validate } from './middleware/validate';
import rateLimit from 'express-rate-limit';
import {
  registerSchema,
  loginSchema,
  productSchema,
  productUpdateSchema,
  orderSchema,
  cartAddSchema,
  cartUpdateSchema,
  reviewSchema,
  bannerSchema,
  profileUpdateSchema,
} from './lib/validation';

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',');
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.post('/api/auth/register', authLimiter, validate({ body: registerSchema }), authController.register);
app.post('/api/auth/login', authLimiter, validate({ body: loginSchema }), authController.login);
app.get('/api/auth/me', requireAuth, authController.getProfile);

app.get('/api/products', productController.listProducts);
app.get('/api/products/:slug', productController.getProductBySlug);
app.post('/api/products', requireAuth, requireAdmin, validate({ body: productSchema }), productController.createProduct);
app.put('/api/products/:id', requireAuth, requireAdmin, validate({ body: productUpdateSchema }), productController.updateProduct);
app.delete('/api/products/:id', requireAuth, requireAdmin, productController.deleteProduct);

app.get('/api/categories', categoryController.listCategories);
app.get('/api/categories/:slug', categoryController.getCategoryBySlug);
app.post('/api/categories', requireAuth, requireAdmin, categoryController.createCategory);
app.put('/api/categories/:slug', requireAuth, requireAdmin, categoryController.updateCategory);
app.delete('/api/categories/:slug', requireAuth, requireAdmin, categoryController.deleteCategory);

app.post('/api/orders', requireAuth, validate({ body: orderSchema }), orderController.createOrder);
app.get('/api/orders', requireAuth, orderController.listUserOrders);
app.get('/api/admin/orders', requireAuth, requireAdmin, orderController.listAllOrders);
app.put('/api/orders/:id/status', requireAuth, requireAdmin, orderController.updateOrderStatus);
app.post('/api/orders/:id/pay', requireAuth, orderController.verifyPayment);

app.get('/api/cart', requireAuth, cartController.getCart);
app.post('/api/cart', requireAuth, validate({ body: cartAddSchema }), cartController.addToCart);
app.put('/api/cart/:id', requireAuth, validate({ body: cartUpdateSchema }), cartController.updateCartItem);
app.delete('/api/cart/:productId', requireAuth, cartController.removeCartItem);

app.get('/api/users', requireAuth, requireAdmin, userController.listUsers);
app.put('/api/users/profile', requireAuth, validate({ body: profileUpdateSchema }), userController.updateProfile);

app.post('/api/upload', requireAuth, requireAdmin, uploadController.upload.single('image'), uploadController.uploadImage);

app.get('/api/banners', bannerController.listBanners);
app.post('/api/banners', requireAuth, requireAdmin, validate({ body: bannerSchema }), bannerController.createBanner);
app.put('/api/banners/:id', requireAuth, requireAdmin, validate({ body: bannerSchema.partial() }), bannerController.updateBanner);
app.delete('/api/banners/:id', requireAuth, requireAdmin, bannerController.deleteBanner);

app.get('/api/wishlist', requireAuth, wishlistController.getWishlist);
app.post('/api/wishlist', requireAuth, wishlistController.addToWishlist);
app.delete('/api/wishlist/:productId', requireAuth, wishlistController.removeFromWishlist);

app.get('/api/reviews/:productId', reviewController.getProductReviews);
app.post('/api/reviews', requireAuth, validate({ body: reviewSchema }), reviewController.createReview);

app.get('/api/settings', settingsController.getSettings);
app.put('/api/settings', requireAuth, requireAdmin, settingsController.updateSettings);

app.get('/api/addresses', requireAuth, addressController.listAddresses);
app.post('/api/addresses', requireAuth, addressController.createAddress);
app.put('/api/addresses/:id', requireAuth, addressController.updateAddress);
app.delete('/api/addresses/:id', requireAuth, addressController.deleteAddress);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
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
