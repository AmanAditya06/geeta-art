"use client"

import Link from "next/link"
import { ShoppingCart, Trash2, Minus, Plus, ArrowLeft, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"
import { useCart } from "@/store/cart"
import { handleImageError, getProductFallback } from "@/lib/placeholders"

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, itemCount } = useCart()

  const subtotal = total
  const shipping = subtotal > 50000 ? 0 : 499
  const tax = Math.round(subtotal * 0.18)
  const grandTotal = subtotal + shipping + tax

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <div className="text-wood-muted/30 mb-6">
          <ShoppingCart className="size-20 mx-auto" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-wood-dark mb-3">
          Your Cart is Empty
        </h1>
        <p className="text-wood-muted mb-8">
          Looks like you haven&apos;t added anything to your cart yet.
        </p>
        <Link href="/shop">
          <Button size="lg">
            <ArrowLeft className="size-4 mr-2" /> Continue Shopping
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-3xl font-bold text-wood-dark">Shopping Cart</h1>
        <span className="text-wood-muted text-sm">{itemCount} item{itemCount !== 1 ? "s" : ""}</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex gap-4 sm:gap-6">
                  <Link href={`/products/${item.slug}`}>
                    <div className="size-20 sm:size-24 shrink-0 rounded-xl bg-gradient-to-br from-wood-border/30 to-wood-border/10 overflow-hidden flex items-center justify-center">
                      <img src={item.image || getProductFallback()} alt={item.name} className="size-full object-cover" onError={(e) => handleImageError(e, "product")} />
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link href={`/products/${item.slug}`}>
                          <h3 className="font-serif font-semibold text-wood-dark hover:text-primary transition-colors">
                            {item.name}
                          </h3>
                        </Link>
                      </div>
                      <p className="font-semibold text-wood-dark whitespace-nowrap">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center border border-wood-border rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1.5 hover:bg-cream transition-colors"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1.5 hover:bg-cream transition-colors"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-wood-muted hover:text-red-500 transition-colors text-sm flex items-center gap-1"
                      >
                        <Trash2 className="size-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          <div className="pt-2">
            <Link href="/shop">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="size-4 mr-1" /> Continue Shopping
              </Button>
            </Link>
          </div>
        </div>

        <div>
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <h2 className="font-serif text-lg font-semibold text-wood-dark mb-4">
                Order Summary
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-wood-muted">Subtotal</span>
                  <span className="font-medium text-wood-dark">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-wood-muted">Shipping</span>
                  <span className={shipping === 0 ? "text-green-600 font-medium" : "text-wood-dark"}>
                    {shipping === 0 ? "Free" : formatPrice(shipping)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-wood-muted">Tax (18% GST)</span>
                  <span className="font-medium text-wood-dark">{formatPrice(tax)}</span>
                </div>
                {subtotal < 50000 && (
                  <p className="text-xs text-wood-muted bg-primary/5 rounded-lg p-2">
                    Add items worth {formatPrice(50000 - subtotal)} more for free shipping!
                  </p>
                )}
              </div>

              <div className="mt-4 border-t border-wood-border pt-4">
                <div className="flex justify-between text-base">
                  <span className="font-semibold text-wood-dark">Total</span>
                  <span className="font-bold text-primary text-lg">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              <Link href="/checkout">
                <Button className="mt-4 w-full" size="lg">
                  Proceed to Checkout
                </Button>
              </Link>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-wood-muted">
                <Badge variant="outline" className="text-[10px] px-2">Secure</Badge>
                <span>SSL encrypted checkout</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
