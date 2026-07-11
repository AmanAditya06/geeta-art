"use client"

import Link from "next/link"
import { ShoppingCart, Heart, Check, HeartOff } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import StarRating from "@/components/star-rating"
import { formatPrice, cn } from "@/lib/utils"
import { handleImageError, getProductFallback } from "@/lib/placeholders"
import { useCart } from "@/store/cart"
import { useWishlist } from "@/store/wishlist"
import { useState } from "react"

export interface ProductVariant {
  id: string
  name: string
  price: number
  stock: number
  sku: string | null
}

export interface Product {
  id: string
  name: string
  slug: string
  category: string
  categorySlug?: string
  price: number
  compareAtPrice?: number
  image: string
  images?: string[]
  rating: number
  reviewCount: number
  badge?: string
  stock: number
  variants?: ProductVariant[]
}

interface ProductCardProps {
  product: Product
  variant?: "default" | "compact"
}

export default function ProductCard({ product, variant = "default" }: ProductCardProps) {
  const { addItem } = useCart()
  const { has, toggle } = useWishlist()
  const [added, setAdded] = useState(false)
  const wishlisted = has(product.id)
  const discount = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : 0

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      comparePrice: product.compareAtPrice,
      image: product.image,
      slug: product.slug,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <Card className={cn(
      "group overflow-hidden transition-all hover:shadow-lg",
      variant === "compact" && "flex flex-row items-center gap-3 p-3"
    )}>
      <Link href={`/products/${product.slug}`}>
        <div className={cn(
          "relative overflow-hidden bg-wood-border/20",
          variant === "default" ? "aspect-square" : "size-20 shrink-0 rounded-lg"
        )}>
          <img src={product.image || getProductFallback(product.categorySlug)} alt={product.name} className="size-full object-cover" loading="lazy" onError={(e) => handleImageError(e, "product", product.categorySlug)} />
          {product.badge && (
            <Badge
              variant={product.badge === "Sale" ? "destructive" : "default"}
              className="absolute left-2 top-2"
            >
              {product.badge}
              {discount > 0 && product.badge === "Sale" && ` -${discount}%`}
            </Badge>
          )}
        </div>
      </Link>
      <CardContent className={cn(variant === "default" ? "p-4" : "p-0 flex-1")}>
        <div className="mb-1">
          <span className="text-xs uppercase tracking-wider text-wood-muted">
            {product.category}
          </span>
        </div>
        <Link href={`/products/${product.slug}`}>
          <h3 className={cn(
            "font-serif font-semibold text-wood-dark transition-colors group-hover:text-primary",
            variant === "default" ? "text-base" : "text-sm"
          )}>
            {product.name}
          </h3>
        </Link>
        <div className="mt-1 flex items-center gap-2">
          <StarRating rating={product.rating} />
          <span className="text-xs text-wood-muted">({product.reviewCount})</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="font-semibold text-primary">
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && (
            <span className="text-sm text-wood-muted line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>
        {variant === "default" && (
          <div className="mt-3 flex gap-2">
            <Button size="sm" className="flex-1" onClick={handleAddToCart}>
              {added ? <><Check className="size-3.5 mr-1" /> Added</> : <><ShoppingCart className="size-3.5 mr-1" /> Add to Cart</>}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle({ id: product.id, name: product.name, price: product.price, image: product.image, slug: product.slug }) }}
              className={wishlisted ? "text-red-500 hover:text-red-600" : ""}
            >
              <Heart className={cn("size-3.5", wishlisted && "fill-current")} />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
