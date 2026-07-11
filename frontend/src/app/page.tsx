import Link from "next/link"
import { ChevronRight, Star, Truck, Hammer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import ProductCard from "@/components/product-card"
import StarRating from "@/components/star-rating"
import { testimonials } from "@/lib/sample-data"
import { formatPrice } from "@/lib/utils"
import { PLACEHOLDER, getCategoryFallback, getProductFallback } from "@/lib/placeholders"
import { HeroCarousel } from "@/components/hero-carousel"
import { prisma } from "@/lib/prisma"
import type { Product } from "@/components/product-card"

function normalizeProduct(p: any): Product {
  let images: string[] = []
  if (Array.isArray(p.images)) images = p.images
  else if (typeof p.images === 'string') { try { const parsed = JSON.parse(p.images); images = Array.isArray(parsed) ? parsed : [] } catch {} }
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    category: p.category?.name || "",
    categorySlug: p.category?.slug || "",
    price: p.price,
    compareAtPrice: p.comparePrice || undefined,
    image: images[0] || getProductFallback(p.category?.slug),
    images,
    rating: p.avgRating || 4.5,
    reviewCount: p.reviewCount || 0,
    badge: p.comparePrice ? "Sale" : p.isFeatured ? "Best Seller" : "",
    stock: p.stock,
    variants: Array.isArray(p.variants) ? p.variants.map((v: any) => ({ id: v.id, name: v.name, price: v.price, stock: v.stock, sku: v.sku })) : [],
  }
}

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [featuredRows, categories, banners, settingsRows] = await Promise.all([
    prisma.product.findMany({
      where: { isFeatured: true, isPublished: true },
      take: 8,
      include: { category: true, variants: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.category.findMany({
      include: { _count: { select: { products: true } } },
    }),
    prisma.banner.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    }),
    prisma.siteSetting.findMany(),
  ])

  const featuredProducts = featuredRows.map(normalizeProduct)
  const bestSellers = featuredProducts.slice(0, 8)

  const cats = categories.map((c: any) => ({
    name: c.name,
    slug: c.slug,
    description: c.description || "",
    image: c.image || "",
    count: c._count?.products || 0,
  }))

  const settingsObj: Record<string, string> = {}
  for (const s of settingsRows) settingsObj[s.key] = s.value
  const overlayImage = settingsObj.hero_overlay_image || ""

  return (
    <div>
      <HeroCarousel banners={banners} overlayImage={overlayImage} featuredProducts={featuredProducts} />

      {/* Category Grid */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold text-wood-dark sm:text-4xl">
              Discover Our Collections
            </h2>
            <p className="mt-3 text-wood-muted max-w-2xl mx-auto">
              Explore our range of handcrafted wooden furniture, each category thoughtfully designed to bring warmth to your space.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cats.map((cat) => (
              <Link key={cat.slug} href={`/shop?category=${cat.slug}`}>
                <Card className="group overflow-hidden transition-all hover:shadow-lg">
                  <div className="aspect-[4/3] overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
                    <img src={cat.image || getCategoryFallback(cat.slug)} alt={cat.name} className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-serif text-lg font-semibold text-wood-dark group-hover:text-primary transition-colors">
                      {cat.name}
                    </h3>
                    <p className="mt-1 text-sm text-wood-muted">{cat.description}</p>
                    <span className="mt-3 inline-flex items-center text-sm font-medium text-primary group-hover:gap-2 transition-all">
                      Shop Now <ChevronRight className="size-3.5 ml-1" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-serif text-3xl font-bold text-wood-dark sm:text-4xl">
                Best Sellers
              </h2>
              <p className="mt-2 text-wood-muted">
                Our most loved pieces, chosen by customers like you.
              </p>
            </div>
            <Link href="/shop">
              <Button variant="outline" className="hidden sm:flex">
                View All <ChevronRight className="size-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Link href="/shop">
              <Button variant="outline">View All Products</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Brand Story */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
              <img src={PLACEHOLDER.story} alt="Our woodworking workshop" className="size-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                <p className="text-sm italic text-wood-muted">
                  &ldquo;Every piece of wood has a soul. We just help it find its purpose.&rdquo;
                </p>
                <p className="mt-1 text-xs font-semibold text-wood-dark">— Founder, Geeta Art</p>
              </div>
            </div>
            <div>
              <Badge variant="secondary" className="mb-4">Our Story</Badge>
              <h2 className="font-serif text-3xl font-bold text-wood-dark sm:text-4xl">
                Crafted with <span className="text-primary">Passion</span>
              </h2>
              <p className="mt-4 text-wood-muted leading-relaxed">
                For over a decade, Geeta Art has been crafting timeless wooden furniture that blends traditional Indian artistry with contemporary design. Every piece begins as a raw slab of premium sheesham, mango, or teak wood, hand-selected by our master craftsmen.
              </p>
              <p className="mt-3 text-wood-muted leading-relaxed">
                Our workshop in Jaipur is home to skilled artisans who have inherited techniques passed down through generations. From intricate hand carvings to flawless joinery, each furniture piece is a testament to India&apos;s rich woodworking heritage.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                {[
                  { value: "15+", label: "Years" },
                  { value: "5000+", label: "Happy Families" },
                  { value: "200+", label: "Designs" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl bg-white p-4 shadow-sm">
                    <p className="font-serif text-2xl font-bold text-primary">{stat.value}</p>
                    <p className="text-xs text-wood-muted mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
              <Link href="/about">
                <Button className="mt-6" variant="outline">
                  Read Our Story <ChevronRight className="size-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold text-wood-dark sm:text-4xl">
              What Our Customers Say
            </h2>
            <p className="mt-3 text-wood-muted max-w-2xl mx-auto">
              Real reviews from real people who brought Geeta Art into their homes.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {testimonials.map((t) => (
              <Card key={t.id} className="flex flex-col">
                <CardContent className="flex-1 flex flex-col p-5">
                  <StarRating rating={t.rating} size="md" />
                  <p className="mt-3 flex-1 text-sm text-wood-muted leading-relaxed">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="mt-4 border-t border-wood-border pt-3">
                    <p className="text-sm font-semibold text-wood-dark">{t.name}</p>
                    <p className="text-xs text-wood-muted">{t.location}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Craftsmanship Features */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold text-wood-dark sm:text-4xl">
              Our Craftsmanship
            </h2>
            <p className="mt-3 text-wood-muted max-w-2xl mx-auto">
              What makes Geeta Art furniture truly special.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Hammer,
                title: "Premium Wood",
                desc: "We source only the finest sheesham, teak, and mango wood from sustainable forests. Each plank is carefully inspected for grain, strength, and character.",
              },
              {
                icon: Star,
                title: "Handcrafted Quality",
                desc: "Every joint is hand-fitted, every surface hand-sanded to perfection. Our artisans spend days on a single piece to ensure flawless finish and durability.",
              },
              {
                icon: Truck,
                title: "Pan India Delivery",
                desc: "We deliver across all major cities in India. Each piece is carefully packed in custom crates and insured during transit to reach you in pristine condition.",
              },
            ].map((feature) => (
              <Card key={feature.title} className="text-center p-8">
                <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10">
                  <feature.icon className="size-7 text-primary" />
                </div>
                <h3 className="mt-5 font-serif text-lg font-semibold text-wood-dark">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm text-wood-muted leading-relaxed">
                  {feature.desc}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter / CTA */}
      <section className="bg-wood-dark py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="font-serif text-3xl font-bold text-white sm:text-4xl">
            Ready to Transform Your Space?
          </h2>
          <p className="mt-4 text-wood-border/80">
            Browse our full collection and find the perfect piece for your home.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/shop">
              <Button size="lg" variant="accent">
                Shop All Furniture
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="secondary" className="bg-white/10 text-white border border-white/30 hover:bg-white/20">
                Get in Touch
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
