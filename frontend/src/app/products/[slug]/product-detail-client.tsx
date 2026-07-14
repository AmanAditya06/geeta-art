"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  ShoppingCart,
  Heart,
  Share2,
  Check,
  Minus,
  Plus,
  Truck,
  Shield,
  RotateCcw,
  ChevronLeft,
  Star,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import ProductCard from "@/components/product-card"
import StarRating from "@/components/star-rating"
import { formatPrice, cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { useCart } from "@/store/cart"
import { useWishlist } from "@/store/wishlist"
import { handleImageError, getProductFallback } from "@/lib/placeholders"
import type { Product } from "@/components/product-card"

interface ReviewData {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  user: { id: string; name: string | null; image: string | null }
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api"

export default function ProductDetailClient({ product, relatedProducts = [] }: { product: Product; relatedProducts?: Product[] }) {
  const [selectedVariant, setSelectedVariant] = useState<{ id: string; name: string; price: number; stock: number } | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [addedToCart, setAddedToCart] = useState(false)
  const [reviews, setReviews] = useState<ReviewData[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const { addItem } = useCart()
  const { has, toggle } = useWishlist()
  const wishlisted = has(product.id)

  useEffect(() => {
    if (!product.id) return
    setReviewsLoading(true)
    fetch(`${API_BASE}/reviews/${product.id}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.reviews) setReviews(data.reviews)
      })
      .catch(() => {})
      .finally(() => setReviewsLoading(false))
  }, [product.id])

  const finalPrice = selectedVariant ? selectedVariant.price : product.price
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock
  const discount = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : 0

  const handleAddToCart = () => {
    addItem({
      id: selectedVariant ? `${product.id}-${selectedVariant.id}` : product.id,
      name: selectedVariant ? `${product.name} (${selectedVariant.name})` : product.name,
      price: finalPrice,
      comparePrice: product.compareAtPrice || undefined,
      image: product.image,
      slug: product.slug,
      quantity,
    })
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  const thumbnails = [0, 1, 2, 3]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-wood-muted mb-6">
        <Link href="/" className="hover:text-primary">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-primary">Shop</Link>
        <span>/</span>
        <Link href={`/shop?category=${product.category.toLowerCase().replace(" ", "-")}`} className="hover:text-primary">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-wood-dark font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image Gallery */}
        <div>
          <div className="relative aspect-square rounded-2xl bg-gradient-to-br from-wood-border/30 to-wood-border/10 overflow-hidden flex items-center justify-center">
            <img src={product.image || getProductFallback(product.categorySlug)} alt={product.name} className="size-full object-cover" onError={(e) => handleImageError(e, "product", product.categorySlug)} />
            {product.badge && (
              <Badge className="absolute left-4 top-4 text-sm px-3 py-1">
                {product.badge}
              </Badge>
            )}
          </div>
          <div className="mt-4 grid grid-cols-4 gap-3">
            {thumbnails.map((_, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={cn(
                  "aspect-square rounded-xl border-2 overflow-hidden flex items-center justify-center bg-wood-border/10 transition-all",
                  selectedImage === i ? "border-primary" : "border-transparent hover:border-wood-border"
                )}
              >
                <img src={product.images?.[i] || getProductFallback(product.categorySlug)} alt="" className="size-full object-cover" onError={(e) => handleImageError(e, "product", product.categorySlug)} />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-wood-muted">
              {product.category}
            </span>
            {currentStock <= 5 && currentStock > 0 && (
              <Badge variant="warning">Only {currentStock} left</Badge>
            )}
            {currentStock === 0 && <Badge variant="destructive">Out of Stock</Badge>}
          </div>

          <h1 className="font-serif text-2xl font-bold text-wood-dark sm:text-3xl">
            {product.name}
          </h1>

          <div className="mt-3 flex items-center gap-3">
            <StarRating rating={product.rating} size="md" showValue />
            <span className="text-sm text-wood-muted">
              ({product.reviewCount} reviews)
            </span>
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary">
              {formatPrice(finalPrice)}
            </span>
            {product.compareAtPrice && (
              <span className="text-lg text-wood-muted line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
            {discount > 0 && (
              <Badge variant="destructive">Save {discount}%</Badge>
            )}
          </div>

          <p className="mt-4 text-wood-muted leading-relaxed">
            {product.description || `Handcrafted from premium quality solid wood, this ${product.name.toLowerCase()} brings timeless elegance to your space. Each piece features unique wood grain patterns and meticulous attention to detail.`}
          </p>

          <div className="mt-6 space-y-4">
            {product.variants && product.variants.length > 0 && (
              <div>
                <label className="text-sm font-semibold text-wood-dark mb-2 block">Variant</label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(
                        selectedVariant?.id === v.id ? null : { id: v.id, name: v.name, price: v.price, stock: v.stock }
                      )}
                      className={cn(
                        "rounded-lg border px-4 py-2 text-sm transition-all",
                        selectedVariant?.id === v.id
                          ? "border-primary bg-primary/10 text-primary font-medium"
                          : "border-wood-border text-wood-muted hover:border-primary/50"
                      )}
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-semibold text-wood-dark mb-2 block">Quantity</label>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-wood-border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2.5 hover:bg-cream transition-colors"
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                    className="p-2.5 hover:bg-cream transition-colors"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
                {currentStock > 0 && (
                  <span className="text-xs text-wood-muted">
                    {currentStock} available
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              className={cn(
                "flex-1 transition-all",
                addedToCart && "bg-green-600 hover:bg-green-700"
              )}
              onClick={handleAddToCart}
              disabled={currentStock === 0}
            >
              {addedToCart ? (
                <>
                  <Check className="size-4 mr-1" /> Added to Cart
                </>
              ) : (
                <>
                  <ShoppingCart className="size-4 mr-1" /> Add to Cart
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => toggle({ id: product.id, name: product.name, price: product.price, image: product.image, slug: product.slug })}
              className={cn(wishlisted && "text-red-500 hover:text-red-600 border-red-200")}
            >
              <Heart className={cn("size-4 mr-1", wishlisted && "fill-current")} />
              {wishlisted ? "Wishlisted" : "Wishlist"}
            </Button>
            <Button variant="ghost" size="icon" className="size-12 shrink-0">
              <Share2 className="size-4" />
            </Button>
          </div>

          {/* Features */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { icon: Truck, label: "Free Delivery", desc: "Pan India" },
              { icon: Shield, label: "1 Year Warranty", desc: "Quality assured" },
              { icon: RotateCcw, label: "Easy Returns", desc: "7-day policy" },
            ].map((feat) => (
              <div key={feat.label} className="flex items-center gap-3 rounded-xl bg-white border border-wood-border p-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <feat.icon className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-wood-dark">{feat.label}</p>
                  <p className="text-xs text-wood-muted">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-16">
        <h2 className="font-serif text-2xl font-bold text-wood-dark mb-8">
          Customer Reviews ({product.reviewCount})
        </h2>
        {reviewsLoading ? (
          <div className="text-center py-10 text-wood-muted">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-wood-muted">
              No reviews yet. Be the first to review this product!
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                        {review.user?.name?.charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-wood-dark">{review.user?.name || "Anonymous"}</p>
                        <p className="text-xs text-wood-muted">
                          {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <StarRating rating={review.rating} />
                  </div>
                  <p className="text-sm text-wood-muted leading-relaxed">{review.comment}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-serif text-2xl font-bold text-wood-dark">
                You May Also Like
              </h2>
              <p className="text-wood-muted mt-1">Similar pieces from our collection.</p>
            </div>
            <Link href="/shop">
              <Button variant="outline" size="sm">
                View All <ChevronLeft className="size-3.5 ml-1 rotate-180" />
              </Button>
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
