import type { Product } from "@/components/product-card"

const IMG = "https://images.unsplash.com/photo"

export const products: Product[] = [
  { id: "1", name: "Sheesham Wood Dining Table", slug: "sheesham-wood-dining-table", category: "Dining Tables", price: 24999, compareAtPrice: 32999, image: `${IMG}-1586023492125-27b2c045efd7?w=600&h=600&fit=crop`, rating: 4.5, reviewCount: 128, badge: "Sale", stock: 15 },
  { id: "2", name: "Handcarved Wooden Sofa Set", slug: "handcarved-wooden-sofa-set", category: "Sofas", price: 45999, compareAtPrice: 58999, image: `${IMG}-1555041469-a586c61ea9bc?w=600&h=600&fit=crop`, rating: 4.8, reviewCount: 94, badge: "Best Seller", stock: 8 },
  { id: "3", name: "Mango Wood Arm Chair", slug: "mango-wood-arm-chair", category: "Chairs", price: 8999, compareAtPrice: 11999, image: `${IMG}-1567538096630-e0c55bd6374c?w=600&h=600&fit=crop`, rating: 4.3, reviewCount: 67, badge: "Sale", stock: 25 },
  { id: "4", name: "Solid Wood Queen Bed", slug: "solid-wood-queen-bed", category: "Beds", price: 35999, compareAtPrice: 44999, image: `${IMG}-1505693416388-ac5ce068fe85?w=600&h=600&fit=crop`, rating: 4.7, reviewCount: 56, badge: "Best Seller", stock: 10 },
  { id: "5", name: "Teak Wood Bookshelf", slug: "teak-wood-bookshelf", category: "Shelves", price: 15999, compareAtPrice: 19999, image: `${IMG}-1597072689227-888de0e2a15b?w=600&h=600&fit=crop`, rating: 4.4, reviewCount: 41, badge: "", stock: 20 },
  { id: "6", name: "Rosewood Display Cabinet", slug: "rosewood-display-cabinet", category: "Cabinets", price: 32999, compareAtPrice: 41999, image: `${IMG}-1583847268964-b28dc8f51f92?w=600&h=600&fit=crop`, rating: 4.6, reviewCount: 33, badge: "Sale", stock: 6 },
  { id: "7", name: "Oak Wood Coffee Table", slug: "oak-wood-coffee-table", category: "Dining Tables", price: 12999, image: `${IMG}-1532372576444-dda954194ad0?w=600&h=600&fit=crop`, rating: 4.2, reviewCount: 89, badge: "New", stock: 18 },
  { id: "8", name: "Carved Wooden Headboard", slug: "carved-wooden-headboard", category: "Beds", price: 18999, compareAtPrice: 24999, image: `${IMG}-1616627547584-bf28cee262db?w=600&h=600&fit=crop`, rating: 4.9, reviewCount: 27, badge: "Best Seller", stock: 4 },
  { id: "9", name: "Rustic Wooden Bench", slug: "rustic-wooden-bench", category: "Chairs", price: 6999, image: `${IMG}-1592078615290-033ee584e267?w=600&h=600&fit=crop`, rating: 4.1, reviewCount: 52, badge: "", stock: 30 },
  { id: "10", name: "Sheesham TV Unit", slug: "sheesham-tv-unit", category: "Cabinets", price: 21999, compareAtPrice: 27999, image: `${IMG}-1595511890410-3a8fb1d7d0a0?w=600&h=600&fit=crop`, rating: 4.5, reviewCount: 44, badge: "Sale", stock: 12 },
  { id: "11", name: "Wooden Bar Stool Set", slug: "wooden-bar-stool-set", category: "Chairs", price: 7999, compareAtPrice: 9999, image: `${IMG}-1506439773649-6e0eb8cfb237?w=600&h=600&fit=crop`, rating: 4.3, reviewCount: 38, badge: "", stock: 22 },
  { id: "12", name: "Acacia Wood Side Table", slug: "acacia-wood-side-table", category: "Dining Tables", price: 5999, image: `${IMG}-1532372576444-dda954194ad0?w=600&h=600&fit=crop`, rating: 4.0, reviewCount: 73, badge: "New", stock: 35 },
  { id: "13", name: "L-Shaped Wooden Sofa", slug: "l-shaped-wooden-sofa", category: "Sofas", price: 54999, compareAtPrice: 69999, image: `${IMG}-1493663284031-b7e3aefcae8e?w=600&h=600&fit=crop`, rating: 4.7, reviewCount: 61, badge: "Best Seller", stock: 5 },
  { id: "14", name: "Handcrafted Wall Shelf", slug: "handcrafted-wall-shelf", category: "Shelves", price: 3999, compareAtPrice: 5499, image: `${IMG}-1597072689227-888de0e2a15b?w=600&h=600&fit=crop`, rating: 4.2, reviewCount: 105, badge: "Sale", stock: 40 },
  { id: "15", name: "Mahogany Writing Desk", slug: "mahogany-writing-desk", category: "Dining Tables", price: 19999, compareAtPrice: 25999, image: `${IMG}-1518455027359-f3f8164ba6bd?w=600&h=600&fit=crop`, rating: 4.6, reviewCount: 48, badge: "", stock: 9 },
  { id: "16", name: "Wooden Patio Chair", slug: "wooden-patio-chair", category: "Chairs", price: 4999, image: `${IMG}-1567538096630-e0c55bd6374c?w=600&h=600&fit=crop`, rating: 4.0, reviewCount: 82, badge: "New", stock: 28 },
]

export const categories = [
  { name: "Sofas", slug: "sofas", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop", count: 14, description: "Elegant seating crafted from solid wood" },
  { name: "Dining Tables", slug: "dining-tables", image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=600&fit=crop", count: 18, description: "Gather around handcrafted tables" },
  { name: "Chairs", slug: "chairs", image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&h=600&fit=crop", count: 22, description: "Comfort meets traditional design" },
  { name: "Beds", slug: "beds", image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=600&fit=crop", count: 10, description: "Sleep in handcrafted luxury" },
  { name: "Cabinets", slug: "cabinets", image: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&h=600&fit=crop", count: 12, description: "Storage with artisan charm" },
  { name: "Shelves", slug: "shelves", image: "https://images.unsplash.com/photo-1597072689227-888de0e2a15b?w=600&h=600&fit=crop", count: 8, description: "Display your stories beautifully" },
]

export const testimonials = [
  { id: 1, name: "Priya Sharma", location: "Mumbai", rating: 5, text: "Absolutely love the dining table! The craftsmanship is outstanding, and the wood grain is gorgeous. It's the centerpiece of our home now.", image: "" },
  { id: 2, name: "Rajesh Patel", location: "Ahmedabad", rating: 5, text: "The bed frame is stunning - solid sheesham wood with beautiful carvings. Worth every penny. Delivery was prompt and the team assembled it perfectly.", image: "" },
  { id: 3, name: "Ananya Gupta", location: "Delhi", rating: 4, text: "Bought a bookshelf and a coffee table. The quality exceeded my expectations. The warm finish matches perfectly with my home decor.", image: "" },
  { id: 4, name: "Vikram Singh", location: "Jaipur", rating: 5, text: "Geeta Art is a gem for wooden furniture. I've bought multiple pieces and each one is unique. The attention to detail in their handcarved work is remarkable.", image: "" },
]

export const orders = [
  { id: "ORD-001", customer: "Priya Sharma", date: "2024-12-15", total: 24999, status: "delivered", items: 1 },
  { id: "ORD-002", customer: "Rajesh Patel", date: "2024-12-18", total: 45999, status: "shipped", items: 2 },
  { id: "ORD-003", customer: "Ananya Gupta", date: "2024-12-20", total: 21998, status: "processing", items: 3 },
  { id: "ORD-004", customer: "Vikram Singh", date: "2024-12-22", total: 8999, status: "pending", items: 1 },
  { id: "ORD-005", customer: "Neha Verma", date: "2024-12-23", total: 54999, status: "delivered", items: 1 },
  { id: "ORD-006", customer: "Amit Kumar", date: "2024-12-24", total: 12999, status: "cancelled", items: 1 },
]

export const heroSlides = [
  { id: 1, title: "Handcrafted Elegance", subtitle: "Where tradition meets modern living", cta: "Explore Collection", image: "" },
  { id: 2, title: "Solid Wood, Solid Quality", subtitle: "Each piece carved with passion and precision", cta: "Shop Now", image: "" },
  { id: 3, title: "Sustainable Luxury", subtitle: "Eco-friendly furniture for a better tomorrow", cta: "Discover More", image: "" },
]
