"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { Plus, Search, Edit3, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"
import { useSession } from "next-auth/react"
import { api } from "@/lib/api"
import { handleImageError, getProductFallback } from "@/lib/placeholders"

interface AdminProduct {
  id: string
  name: string
  slug: string
  category: string
  price: number
  stock: number
  image?: string
}

export default function AdminProductsPage() {
  const { data: session } = useSession()
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [loading, setLoading] = useState(true)

  const loadProducts = () => {
    api.getProducts().then((r) => {
      setProducts(r.products as any)
    }).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const categories = useMemo(() => Array.from(new Set(products.map((p) => p.category))), [products])

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = categoryFilter === "all" || p.category === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [products, search, categoryFilter])

  const handleDelete = async (slug: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return
    const token = (session?.user as any)?.apiToken
    if (!token) return

    try {
      const res = await fetch(`/api/products/${slug}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || "Failed to delete")
      }
      loadProducts()
    } catch (err: any) {
      alert(err.message || "Failed to delete product")
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-2xl font-bold text-wood-dark">Products</h1>
          <p className="text-sm text-gray-500 mt-1">
            {products.length} products total
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="size-4 mr-1" /> Add Product
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 font-semibold text-wood-dark">Product</th>
                  <th className="text-left py-3 px-2 font-semibold text-wood-dark hidden md:table-cell">Category</th>
                  <th className="text-left py-3 px-2 font-semibold text-wood-dark">Price</th>
                  <th className="text-left py-3 px-2 font-semibold text-wood-dark hidden sm:table-cell">Stock</th>
                  <th className="text-left py-3 px-2 font-semibold text-wood-dark hidden lg:table-cell">Status</th>
                  <th className="py-3 px-2"></th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        <div className="size-10 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                          <img src={product.image || getProductFallback((product as any).categorySlug)} alt={product.name} className="size-full object-cover" onError={(e) => handleImageError(e, "product", (product as any).categorySlug)} />
                        </div>
                        <div>
                          <p className="font-medium text-wood-dark">{product.name}</p>
                          <p className="text-xs text-gray-500">#{product.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-gray-600 hidden md:table-cell">{product.category}</td>
                    <td className="py-3 px-2 font-medium text-wood-dark">{formatPrice(product.price)}</td>
                    <td className="py-3 px-2 hidden sm:table-cell">
                      <Badge variant={product.stock <= 5 ? "destructive" : product.stock <= 15 ? "warning" : "success"}>
                        {product.stock}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 hidden lg:table-cell">
                      <Badge variant={product.stock > 0 ? "success" : "destructive"}>
                        {product.stock > 0 ? "Active" : "Out of Stock"}
                      </Badge>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-1">
                        <Link href={`/admin/products/${product.slug}/edit`}>
                          <Button variant="ghost" size="icon">
                            <Edit3 className="size-3.5" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(product.slug)}>
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredProducts.length === 0 && (
            <div className="text-center py-12 text-gray-500">No products found.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
