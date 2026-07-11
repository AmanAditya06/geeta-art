"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Search, X, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { fetchAllProducts } from "@/lib/fetch-products"
import { handleImageError, getProductFallback } from "@/lib/placeholders"
import type { Product } from "@/components/product-card"

interface Props {
  open: boolean
  onClose: () => void
}

export function SearchModal({ open, onClose }: Props) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setQuery("")
      setResults([])
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await fetchAllProducts({ search: query })
        setResults((data.products || []) as Product[])
      } catch {} finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (open) document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative mx-auto mt-20 max-w-2xl px-4">
        <div className="rounded-xl border border-wood-border bg-white shadow-2xl overflow-hidden">
          <div className="flex items-center gap-3 border-b border-wood-border px-4 py-3">
            <Search className="size-5 shrink-0 text-wood-muted" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="border-0 shadow-none px-0 text-base focus-visible:ring-0"
            />
            <button onClick={onClose} className="p-1 text-wood-muted hover:text-wood-dark">
              <X className="size-5" />
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center py-10 text-wood-muted">
                <Loader2 className="size-5 mr-2 animate-spin" /> Searching...
              </div>
            )}
            {!loading && query && results.length === 0 && (
              <div className="text-center py-10 text-wood-muted">No products found for "{query}"</div>
            )}
            {!loading && results.length > 0 && (
              <div className="py-2">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-4 px-4 py-3 hover:bg-cream transition-colors"
                  >
                    <div className="size-12 shrink-0 rounded-lg bg-wood-border/20 flex items-center justify-center overflow-hidden">
                      <img src={product.image || getProductFallback((product as any).categorySlug)} alt={product.name} className="size-full object-cover" onError={(e) => handleImageError(e, "product", (product as any).categorySlug)} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-wood-dark truncate">{product.name}</p>
                      <p className="text-sm text-wood-muted">₹{product.price.toLocaleString("en-IN")}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {!query && (
              <div className="text-center py-10 text-wood-muted text-sm">
                Type to search products...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
