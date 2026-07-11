"use client"

import { Suspense, useState, useEffect, useRef, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { SlidersHorizontal, Grid3X3, List, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import ProductCard from "@/components/product-card"
import { cn } from "@/lib/utils"
import { fetchAllProducts, fetchCategories } from "@/lib/fetch-products"
import type { Product } from "@/components/product-card"

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name", label: "Name" },
]

const ITEMS_PER_PAGE = 12

function ShopContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get("category") || ""
  )
  const [sortBy, setSortBy] = useState("newest")
  const [currentPage, setCurrentPage] = useState(1)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000])
  const [priceInput, setPriceInput] = useState<[string, string]>(["", ""])
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<{ name: string; slug: string; count: number }[]>([])
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const priceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const result = await fetchAllProducts({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        category: selectedCategory || undefined,
        sort: sortBy,
        minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
        maxPrice: priceRange[1] < 100000 ? priceRange[1] : undefined,
      })
      setProducts(result.products as Product[])
      setPagination(result.pagination)
    } finally {
      setLoading(false)
    }
  }, [currentPage, selectedCategory, sortBy, priceRange])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  useEffect(() => {
    setSelectedCategory(searchParams.get("category") || "")
    setCurrentPage(1)
  }, [searchParams])

  useEffect(() => {
    if (priceTimer.current) clearTimeout(priceTimer.current)
  }, [])

  const applyPriceFilter = () => {
    const min = Number(priceInput[0]) || 0
    const max = Number(priceInput[1]) || 100000
    setPriceRange([min, max])
    setCurrentPage(1)
  }

  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug === selectedCategory ? "" : slug)
    setCurrentPage(1)
    const params = new URLSearchParams(searchParams.toString())
    if (slug) params.set("category", slug)
    else params.delete("category")
    router.replace(`/shop?${params.toString()}`)
  }

  const clearFilters = () => {
    setSelectedCategory("")
    setPriceRange([0, 100000])
    setPriceInput(["", ""])
    setCurrentPage(1)
    router.replace("/shop")
  }

  const hasFilters = selectedCategory || priceRange[0] > 0 || priceRange[1] < 100000

  if (loading && products.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center py-20 text-wood-muted">Loading products...</div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-wood-dark sm:text-4xl">
          {selectedCategory
            ? categories.find((c) => c.slug === selectedCategory)?.name || "Shop"
            : "All Furniture"}
        </h1>
        <p className="mt-2 text-wood-muted">
          {pagination.total} product{pagination.total !== 1 ? "s" : ""} found
        </p>
      </div>

      <div className="flex gap-8">
        <aside className="hidden w-64 shrink-0 lg:block">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-base font-semibold text-wood-dark">Filters</h3>
              {hasFilters && (
                <button onClick={clearFilters} className="text-xs text-primary hover:underline">Clear All</button>
              )}
            </div>
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-wood-dark mb-3">Categories</h4>
              <div className="space-y-1.5">
                <button onClick={() => handleCategoryChange("")}
                  className={cn("w-full text-left rounded-lg px-3 py-2 text-sm transition-colors",
                    !selectedCategory ? "bg-primary/10 text-primary font-medium" : "text-wood-muted hover:bg-cream"
                  )}>All Categories</button>
                {categories.map((cat) => (
                  <button key={cat.slug} onClick={() => handleCategoryChange(cat.slug)}
                    className={cn("w-full text-left rounded-lg px-3 py-2 text-sm transition-colors",
                      selectedCategory === cat.slug ? "bg-primary/10 text-primary font-medium" : "text-wood-muted hover:bg-cream"
                    )}>{cat.name} <span className="float-right text-xs opacity-60">({cat.count})</span></button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-wood-dark mb-3">Price Range</h4>
              <div className="flex items-center gap-2 mb-2">
                <input type="number" placeholder="Min" value={priceInput[0]}
                  onChange={(e) => setPriceInput([e.target.value, priceInput[1]])}
                  className="w-full rounded-lg border border-wood-border px-2.5 py-1.5 text-sm text-wood-dark" />
                <span className="text-wood-muted">-</span>
                <input type="number" placeholder="Max" value={priceInput[1]}
                  onChange={(e) => setPriceInput([priceInput[0], e.target.value])}
                  className="w-full rounded-lg border border-wood-border px-2.5 py-1.5 text-sm text-wood-dark" />
              </div>
              <Button size="sm" variant="outline" className="w-full" onClick={applyPriceFilter}>
                Apply
              </Button>
            </div>
          </Card>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="lg:hidden"
                onClick={() => setMobileFiltersOpen(true)}>
                <SlidersHorizontal className="size-4 mr-1" /> Filters
              </Button>
              <div className="hidden sm:flex items-center border border-wood-border rounded-lg overflow-hidden">
                <button onClick={() => setViewMode("grid")}
                  className={cn("p-2 transition-colors",
                    viewMode === "grid" ? "bg-primary text-white" : "text-wood-muted hover:bg-cream"
                  )}><Grid3X3 className="size-4" /></button>
                <button onClick={() => setViewMode("list")}
                  className={cn("p-2 transition-colors",
                    viewMode === "list" ? "bg-primary text-white" : "text-wood-muted hover:bg-cream"
                  )}><List className="size-4" /></button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-wood-muted">Sort by:</label>
              <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1) }}
                className="rounded-lg border border-wood-border bg-white px-3 py-1.5 text-sm text-wood-dark">
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {hasFilters && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedCategory && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {categories.find((c) => c.slug === selectedCategory)?.name}
                  <X className="size-3 cursor-pointer" onClick={() => handleCategoryChange("")} />
                </span>
              )}
              {(priceRange[0] > 0 || priceRange[1] < 100000) && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  ₹{priceRange[0]} - ₹{priceRange[1]}
                  <X className="size-3 cursor-pointer" onClick={() => { setPriceRange([0, 100000]); setPriceInput(["", ""]) }} />
                </span>
              )}
            </div>
          )}

          {loading && <div className="text-center py-10 text-wood-muted">Updating...</div>}

          {!loading && products.length > 0 ? (
            <div className={cn(
              viewMode === "grid"
                ? "grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "flex flex-col gap-4"
            )}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product}
                  variant={viewMode === "list" ? "compact" : "default"} />
              ))}
            </div>
          ) : !loading ? (
            <div className="text-center py-20">
              <div className="text-wood-muted/30 mb-4">
                <svg className="size-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-serif text-xl font-semibold text-wood-dark mb-2">No products found</h3>
              <p className="text-wood-muted mb-4">Try adjusting your filters.</p>
              <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
            </div>
          ) : null}

          {pagination.totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>Previous</Button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <Button key={page} variant={page === currentPage ? "default" : "outline"} size="sm"
                  className="min-w-9" onClick={() => setCurrentPage(page)}>{page}</Button>
              ))}
              <Button variant="outline" size="sm" disabled={currentPage >= pagination.totalPages}
                onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}>Next</Button>
            </div>
          )}
        </div>
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-cream p-6 shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-lg font-semibold text-wood-dark">Filters</h3>
              <button onClick={() => setMobileFiltersOpen(false)}><X className="size-5" /></button>
            </div>
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-wood-dark mb-3">Categories</h4>
              <div className="space-y-1.5">
                <button onClick={() => { handleCategoryChange(""); setMobileFiltersOpen(false) }}
                  className={cn("w-full text-left rounded-lg px-3 py-2 text-sm transition-colors",
                    !selectedCategory ? "bg-primary/10 text-primary font-medium" : "text-wood-muted hover:bg-cream"
                  )}>All Categories</button>
                {categories.map((cat) => (
                  <button key={cat.slug} onClick={() => { handleCategoryChange(cat.slug); setMobileFiltersOpen(false) }}
                    className={cn("w-full text-left rounded-lg px-3 py-2 text-sm transition-colors",
                      selectedCategory === cat.slug ? "bg-primary/10 text-primary font-medium" : "text-wood-muted hover:bg-cream"
                    )}>{cat.name}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-wood-muted">Loading shop...</div>}>
      <ShopContent />
    </Suspense>
  )
}
