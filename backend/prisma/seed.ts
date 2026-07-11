import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@geetaart.com' },
    update: { role: 'ADMIN', password: adminPassword },
    create: {
      name: 'Admin User',
      email: 'admin@geetaart.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  // Create test user
  const userPassword = await bcrypt.hash('user123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'user@geetaart.com' },
    update: { password: userPassword },
    create: {
      name: 'Test User',
      email: 'user@geetaart.com',
      password: userPassword,
      role: 'USER',
    },
  });

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'sofas' },
      update: {},
      create: { name: 'Sofas', slug: 'sofas', description: 'Elegant seating crafted from solid wood', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop' },
    }),
    prisma.category.upsert({
      where: { slug: 'dining-tables' },
      update: {},
      create: { name: 'Dining Tables', slug: 'dining-tables', description: 'Gather around handcrafted tables', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=600&fit=crop' },
    }),
    prisma.category.upsert({
      where: { slug: 'chairs' },
      update: {},
      create: { name: 'Chairs', slug: 'chairs', description: 'Comfort meets traditional design', image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&h=600&fit=crop' },
    }),
    prisma.category.upsert({
      where: { slug: 'beds' },
      update: {},
      create: { name: 'Beds', slug: 'beds', description: 'Sleep in handcrafted luxury', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=600&fit=crop' },
    }),
    prisma.category.upsert({
      where: { slug: 'cabinets' },
      update: {},
      create: { name: 'Cabinets', slug: 'cabinets', description: 'Storage with artisan charm', image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&h=600&fit=crop' },
    }),
    prisma.category.upsert({
      where: { slug: 'shelves' },
      update: {},
      create: { name: 'Shelves', slug: 'shelves', description: 'Display your stories beautifully', image: 'https://images.unsplash.com/photo-1597072689227-888de0e2a15b?w=600&h=600&fit=crop' },
    }),
  ]);

  const catMap = Object.fromEntries(categories.map((c) => [c.name, c.id]));

  // Create products
  const products = [
    { name: 'Sheesham Wood Dining Table', slug: 'sheesham-wood-dining-table', category: 'Dining Tables', price: 24999, comparePrice: 32999, stock: 15, isFeatured: true },
    { name: 'Handcarved Wooden Sofa Set', slug: 'handcarved-wooden-sofa-set', category: 'Sofas', price: 45999, comparePrice: 58999, stock: 8, isFeatured: true },
    { name: 'Mango Wood Arm Chair', slug: 'mango-wood-arm-chair', category: 'Chairs', price: 8999, comparePrice: 11999, stock: 25, isFeatured: true },
    { name: 'Solid Wood Queen Bed', slug: 'solid-wood-queen-bed', category: 'Beds', price: 35999, comparePrice: 44999, stock: 10, isFeatured: true },
    { name: 'Teak Wood Bookshelf', slug: 'teak-wood-bookshelf', category: 'Shelves', price: 15999, comparePrice: 19999, stock: 20 },
    { name: 'Rosewood Display Cabinet', slug: 'rosewood-display-cabinet', category: 'Cabinets', price: 32999, comparePrice: 41999, stock: 6 },
    { name: 'Oak Wood Coffee Table', slug: 'oak-wood-coffee-table', category: 'Dining Tables', price: 12999, comparePrice: 0, stock: 18, isFeatured: true },
    { name: 'Carved Wooden Headboard', slug: 'carved-wooden-headboard', category: 'Beds', price: 18999, comparePrice: 24999, stock: 4 },
    { name: 'Rustic Wooden Bench', slug: 'rustic-wooden-bench', category: 'Chairs', price: 6999, comparePrice: 0, stock: 30 },
    { name: 'Sheesham TV Unit', slug: 'sheesham-tv-unit', category: 'Cabinets', price: 21999, comparePrice: 27999, stock: 12 },
    { name: 'Wooden Bar Stool Set', slug: 'wooden-bar-stool-set', category: 'Chairs', price: 7999, comparePrice: 9999, stock: 22 },
    { name: 'Acacia Wood Side Table', slug: 'acacia-wood-side-table', category: 'Dining Tables', price: 5999, comparePrice: 0, stock: 35 },
    { name: 'L-Shaped Wooden Sofa', slug: 'l-shaped-wooden-sofa', category: 'Sofas', price: 54999, comparePrice: 69999, stock: 5, isFeatured: true },
    { name: 'Handcrafted Wall Shelf', slug: 'handcrafted-wall-shelf', category: 'Shelves', price: 3999, comparePrice: 5499, stock: 40 },
    { name: 'Mahogany Writing Desk', slug: 'mahogany-writing-desk', category: 'Dining Tables', price: 19999, comparePrice: 25999, stock: 9 },
    { name: 'Wooden Patio Chair', slug: 'wooden-patio-chair', category: 'Chairs', price: 4999, comparePrice: 0, stock: 28, isFeatured: true },
  ];

  for (const p of products) {
    const seedNum = products.indexOf(p) + 1;
    const imgUrl = `https://picsum.photos/seed/furniture${seedNum}/400/400`;
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        name: p.name,
        slug: p.slug,
        description: `Beautiful handcrafted ${p.name.toLowerCase()} made from premium quality solid wood. Each piece features unique wood grain patterns and meticulous attention to detail.`,
        price: p.price,
        comparePrice: p.comparePrice || null,
        images: JSON.stringify([imgUrl]),
        stock: p.stock,
        isFeatured: p.isFeatured || false,
        categoryId: catMap[p.category],
      },
    });
  }

  // Create banners
  const bannerImages = [
    'https://picsum.photos/seed/hero1/1200/600',
    'https://picsum.photos/seed/hero2/1200/600',
    'https://picsum.photos/seed/hero3/1200/600',
  ];
  const bannerData = [
    { title: 'Handcrafted Wooden Furniture', subtitle: 'Where tradition meets modern living', image: bannerImages[0], link: '/shop', order: 0, active: true },
    { title: 'Solid Wood, Solid Quality', subtitle: 'Each piece carved with passion and precision', image: bannerImages[1], link: '/shop', order: 1, active: true },
    { title: 'Sustainable Luxury', subtitle: 'Eco-friendly furniture for a better tomorrow', image: bannerImages[2], link: '/shop', order: 2, active: true },
  ];
  for (const b of bannerData) {
    await prisma.banner.create({ data: b });
  }

  console.log('Seed data created successfully!');
  console.log(`  Admin: admin@geetaart.com / admin123 (role: ADMIN)`);
  console.log(`  User:  user@geetaart.com / user123`);
  console.log(`  Categories: ${categories.length}`);
  console.log(`  Products: ${products.length}`);
  console.log(`  Banners: ${bannerData.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
