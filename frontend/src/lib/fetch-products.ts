import { getProductFallback } from "./placeholders"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api"

export async function fetchFeaturedProducts() {
  try {
    const res = await fetch(`${API_BASE}/products?featured=true&limit=8`, { next: { revalidate: 60 } })
    if (!res.ok) throw new Error("Failed to fetch")
    const data = await res.json()
    return data.products.map(normalize)
  } catch {
    const { products: fallbackProducts } = await import("./sample-data")
    return fallbackProducts
      .filter((p: { badge?: string }) => p.badge === "Best Seller")
      .slice(0, 8)
      .map((p: any) => ({
        ...p,
        categorySlug: p.category?.toLowerCase().replace(/\s+/g, "-") || "",
      }))
  }
}

export async function fetchAllProducts(params?: {
  page?: number; limit?: number; category?: string; search?: string;
  sort?: string; minPrice?: number; maxPrice?: number;
}) {
  try {
    const qs = new URLSearchParams()
    if (params?.page) qs.set("page", String(params.page))
    if (params?.limit) qs.set("limit", String(params.limit))
    if (params?.category) qs.set("category", params.category)
    if (params?.search) qs.set("search", params.search)
    if (params?.sort) qs.set("sort", params.sort)
    if (params?.minPrice !== undefined) qs.set("minPrice", String(params.minPrice))
    if (params?.maxPrice !== undefined) qs.set("maxPrice", String(params.maxPrice))
    const query = qs.toString()
    const res = await fetch(`${API_BASE}/products${query ? `?${query}` : ""}`, { next: { revalidate: 60 } })
    if (!res.ok) throw new Error("Failed to fetch")
    const data = await res.json()
    return { products: data.products.map(normalize), pagination: data.pagination }
  } catch {
    const { products: fallback } = await import("./sample-data")
    const mapped = fallback.map((p: any) => ({
      ...p,
      categorySlug: p.category?.toLowerCase().replace(/\s+/g, "-") || "",
    }))
    return {
      products: mapped,
      pagination: { page: 1, limit: 12, total: mapped.length, totalPages: Math.ceil(mapped.length / 12) },
    }
  }
}

export async function fetchProductBySlug(slug: string) {
  try {
    const res = await fetch(`${API_BASE}/products/${slug}`, { next: { revalidate: 60 } })
    if (!res.ok) throw new Error("Not found")
    const data = await res.json()
    return normalize(data)
  } catch {
    const { products: fallback } = await import("./sample-data")
    const found = fallback.find((p: { slug: string }) => p.slug === slug)
    if (!found) return null
    return {
      ...found,
      categorySlug: (found as any).category?.toLowerCase().replace(/\s+/g, "-") || "",
    }
  }
}

export async function fetchCategories() {
  try {
    const res = await fetch(`${API_BASE}/categories`, { next: { revalidate: 60 } })
    if (!res.ok) throw new Error("Failed to fetch")
    const cats = await res.json()
    return cats.map((c: any) => ({
      name: c.name,
      slug: c.slug,
      description: c.description,
      image: c.image || "",
      count: c._count?.products || 0,
    }))
  } catch {
    const { categories: fallback } = await import("./sample-data")
    return fallback
  }
}

function normalize(p: any) {
  let images: string[] = []
  if (Array.isArray(p.images)) { images = p.images }
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
    description: p.description || "",
    variants: Array.isArray(p.variants) ? p.variants.map((v: any) => ({
      id: v.id,
      name: v.name,
      price: v.price,
      stock: v.stock,
      sku: v.sku,
    })) : [],
  }
}
