import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

async function main() {
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

  const categories = await Promise.all([
    prisma.category.upsert({ where: { slug: 'sofas' }, update: {}, create: { name: 'Sofas', slug: 'sofas', description: 'Elegant seating crafted from solid wood', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop' } }),
    prisma.category.upsert({ where: { slug: 'dining-tables' }, update: {}, create: { name: 'Dining Tables', slug: 'dining-tables', description: 'Gather around handcrafted tables', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=600&fit=crop' } }),
    prisma.category.upsert({ where: { slug: 'chairs' }, update: {}, create: { name: 'Chairs', slug: 'chairs', description: 'Comfort meets traditional design', image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&h=600&fit=crop' } }),
    prisma.category.upsert({ where: { slug: 'beds' }, update: {}, create: { name: 'Beds', slug: 'beds', description: 'Sleep in handcrafted luxury', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=600&fit=crop' } }),
    prisma.category.upsert({ where: { slug: 'cabinets' }, update: {}, create: { name: 'Cabinets', slug: 'cabinets', description: 'Storage with artisan charm', image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&h=600&fit=crop' } }),
    prisma.category.upsert({ where: { slug: 'shelves' }, update: {}, create: { name: 'Shelves', slug: 'shelves', description: 'Display your stories beautifully', image: 'https://images.unsplash.com/photo-1597072689227-888de0e2a15b?w=600&h=600&fit=crop' } }),
  ]);

  const catMap = Object.fromEntries(categories.map((c) => [c.name, c.id]));

  const products = [
    { name: 'Sheesham Wood Sofa Set', slug: 'sheesham-wood-sofa-set', description: 'Handcrafted solid Sheesham wood sofa with comfortable cushioned seating. Perfect for your living room.', price: 45999, comparePrice: 55999, images: ['https://picsum.photos/seed/sofa1/600/600', 'https://picsum.photos/seed/sofa1b/600/600'], stock: 10, isFeatured: true, categoryId: catMap['Sofas'], variants: [{ name: '3-Seater', price: 45999 }, { name: 'L-Shape', price: 65999 }] },
    { name: 'Classic Wooden Dining Table', slug: 'classic-wooden-dining-table', description: '6-seater solid wood dining table with intricate carved legs. Seats 6 comfortably.', price: 35999, comparePrice: 42999, images: ['https://picsum.photos/seed/dining1/600/600', 'https://picsum.photos/seed/dining1b/600/600'], stock: 15, isFeatured: true, categoryId: catMap['Dining Tables'], variants: [{ name: '6-Seater', price: 35999 }, { name: '8-Seater', price: 45999 }] },
    { name: 'Handcrafted Wooden Chair', slug: 'handcrafted-wooden-chair', description: 'Solid Sheesham wood chair with handwoven cane backrest. Comfortable and durable.', price: 8999, comparePrice: null, images: ['https://picsum.photos/seed/chair1/600/600', 'https://picsum.photos/seed/chair1b/600/600'], stock: 50, isFeatured: false, categoryId: catMap['Chairs'] },
    { name: 'Wooden Queen Bed', slug: 'wooden-queen-bed', description: 'Sturdy queen-size wooden bed frame with elegant headboard design. No box spring needed.', price: 52999, comparePrice: 62999, images: ['https://picsum.photos/seed/bed1/600/600', 'https://picsum.photos/seed/bed1b/600/600'], stock: 8, isFeatured: true, categoryId: catMap['Beds'] },
    { name: 'Sheesham Cabinet', slug: 'sheesham-cabinet', description: 'Multi-purpose wooden cabinet with ample storage space. Ideal for living room or bedroom.', price: 28999, comparePrice: null, images: ['https://picsum.photos/seed/cabinet1/600/600', 'https://picsum.photos/seed/cabinet1b/600/600'], stock: 12, isFeatured: false, categoryId: catMap['Cabinets'] },
    { name: 'Wall Mounted Shelf', slug: 'wall-mounted-shelf', description: 'Modern wooden shelf with metal brackets for your favorite books and decor.', price: 7999, comparePrice: null, images: ['https://picsum.photos/seed/shelf1/600/600', 'https://picsum.photos/seed/shelf1b/600/600'], stock: 30, isFeatured: false, categoryId: catMap['Shelves'] },
    { name: 'Luxury Sofa Set', slug: 'luxury-sofa-set', description: 'Premium sofa set with carved wooden frame and velvet upholstery.', price: 69999, comparePrice: 84999, images: ['https://picsum.photos/seed/sofa2/600/600'], stock: 5, isFeatured: true, categoryId: catMap['Sofas'] },
    { name: 'Round Dining Table', slug: 'round-dining-table', description: 'Beautiful round dining table for 4-6 people with central pedestal design.', price: 29999, comparePrice: null, images: ['https://picsum.photos/seed/dining2/600/600'], stock: 10, isFeatured: false, categoryId: catMap['Dining Tables'] },
    { name: 'Ergonomic Office Chair', slug: 'ergonomic-office-chair', description: 'Comfortable wooden office chair with ergonomic backrest and armrests.', price: 12999, comparePrice: null, images: ['https://picsum.photos/seed/chair2/600/600'], stock: 20, isFeatured: false, categoryId: catMap['Chairs'] },
    { name: 'Wooden King Bed', slug: 'wooden-king-bed', description: 'Luxurious king-size wooden bed with carved headboard and footboard.', price: 69999, comparePrice: 79999, images: ['https://picsum.photos/seed/bed2/600/600'], stock: 6, isFeatured: true, categoryId: catMap['Beds'] },
    { name: 'Display Cabinet', slug: 'display-cabinet', description: 'Glass-front display cabinet for showcasing your collectibles and dinnerware.', price: 34999, comparePrice: null, images: ['https://picsum.photos/seed/cabinet2/600/600'], stock: 7, isFeatured: false, categoryId: catMap['Cabinets'] },
    { name: 'Floating Shelves Set', slug: 'floating-shelves-set', description: 'Set of 3 wooden floating shelves for modern wall decor.', price: 5999, comparePrice: null, images: ['https://picsum.photos/seed/shelf2/600/600'], stock: 40, isFeatured: false, categoryId: catMap['Shelves'] },
    { name: 'Recliner Sofa', slug: 'recliner-sofa', description: 'Comfortable wooden recliner sofa with adjustable backrest and footrest.', price: 55999, comparePrice: null, images: ['https://picsum.photos/seed/sofa3/600/600'], stock: 4, isFeatured: false, categoryId: catMap['Sofas'] },
    { name: 'Farmhouse Dining Table', slug: 'farmhouse-dining-table', description: 'Large farmhouse-style dining table made from reclaimed wood.', price: 42999, comparePrice: null, images: ['https://picsum.photos/seed/dining3/600/600'], stock: 8, isFeatured: false, categoryId: catMap['Dining Tables'] },
    { name: 'Rocking Chair', slug: 'rocking-chair', description: 'Classic wooden rocking chair with smooth gliding motion.', price: 14999, comparePrice: null, images: ['https://picsum.photos/seed/chair3/600/600'], stock: 15, isFeatured: false, categoryId: catMap['Chairs'] },
    { name: 'Storage Bed', slug: 'storage-bed', description: 'Queen-size bed with built-in storage drawers underneath.', price: 59999, comparePrice: 69999, images: ['https://picsum.photos/seed/bed3/600/600'], stock: 10, isFeatured: true, categoryId: catMap['Beds'] },
  ];

  for (const p of products) {
    const { variants, ...productData } = p;
    const dbData = { ...productData, images: JSON.stringify(productData.images) };
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: dbData,
      create: {
        ...dbData,
        variants: variants && variants.length > 0 ? {
          create: variants.map((v: any) => ({
            name: v.name,
            price: v.price,
            stock: v.stock || 0,
            sku: v.sku,
          })),
        } : undefined,
      },
    });
  }

  const bannerData = [
    { title: 'Handcrafted Furniture', subtitle: 'Bringing traditional Indian craftsmanship to your home', image: 'https://picsum.photos/seed/banner1/1920/600', link: '/products', active: true, order: 0 },
    { title: 'Premium Wooden Sofas', subtitle: 'Up to 30% off on selected items', image: 'https://picsum.photos/seed/banner2/1920/600', link: '/products?category=sofas', active: true, order: 1 },
    { title: 'Sheesham Collection', subtitle: 'Discover our exclusive range of Sheesham wood furniture', image: 'https://picsum.photos/seed/banner3/1920/600', link: '/products?search=sheesham', active: true, order: 2 },
  ];

  for (const b of bannerData) {
    await prisma.banner.create({ data: b });
  }

  console.log(`Admin user: admin@geetaart.com / admin123`);
  console.log(`Test user: user@geetaart.com / user123`);
  console.log(`Created ${categories.length} categories`);
  console.log(`Created ${products.length} products`);
  console.log(`Created ${bannerData.length} banners`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
