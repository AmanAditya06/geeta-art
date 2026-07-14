import { getProductFallback } from "./placeholders"
import { parseProductImages } from "./fetch-products"

const API_BASE = "/api"

interface FetchOptions extends RequestInit {
  token?: string
}

async function fetchAPI<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, ...fetchOpts } = options
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((fetchOpts.headers as Record<string, string>) || {}),
  }
  if (token) headers["Authorization"] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${endpoint}`, { headers, ...fetchOpts })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message || `API error: ${res.status}`)
  }
  return res.json()
}

export interface ApiProduct {
  id: string
  name: string
  slug: string
  description: string
  price: number
  comparePrice: number | null
  images: string | string[]
  stock: number
  isFeatured: boolean
  isPublished: boolean
  categoryId: string
  category: { name: string; slug: string }
  variants: string
  avgRating: number | null
  reviewCount: number
}

export interface ApiCategory {
  id: string
  name: string
  slug: string
  description: string
  image: string | null
  _count: { products: number }
}

export interface PaginatedResponse<T> {
  products: T[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

function normalizeProduct(p: ApiProduct) {
  const images = parseProductImages(p)
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    category: p.category.name,
    categorySlug: p.category.slug,
    price: p.price,
    compareAtPrice: p.comparePrice || undefined,
    image: images[0] || getProductFallback(p.category.slug),
    images,
    rating: p.avgRating || 4.5,
    reviewCount: p.reviewCount,
    badge: p.comparePrice ? "Sale" : p.isFeatured ? "Best Seller" : "",
    stock: p.stock,
    description: p.description,
    variants: Array.isArray((p as any).variants) ? (p as any).variants.map((v: any) => ({
      id: v.id,
      name: v.name,
      price: v.price,
      stock: v.stock,
      sku: v.sku,
    })) : [],
  }
}

export type NormalizedProduct = ReturnType<typeof normalizeProduct>

export const api = {
  async login(email: string, password: string) {
    return fetchAPI<{ token: string; user: { id: string; name: string; email: string; role: string; image: string | null } }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  },

  async getProducts(params?: {
    page?: number; limit?: number; category?: string; search?: string;
    sort?: string; minPrice?: number; maxPrice?: number; featured?: boolean;
  }) {
    const qs = new URLSearchParams()
    if (params?.page) qs.set("page", String(params.page))
    if (params?.limit) qs.set("limit", String(params.limit))
    if (params?.category) qs.set("category", params.category)
    if (params?.search) qs.set("search", params.search)
    if (params?.sort) qs.set("sort", params.sort)
    if (params?.minPrice !== undefined) qs.set("minPrice", String(params.minPrice))
    if (params?.maxPrice !== undefined) qs.set("maxPrice", String(params.maxPrice))
    if (params?.featured) qs.set("featured", "true")
    const query = qs.toString()
    const data = await fetchAPI<PaginatedResponse<ApiProduct>>(`/products${query ? `?${query}` : ""}`)
    return {
      products: data.products.map(normalizeProduct),
      pagination: data.pagination,
    }
  },

  async getProduct(slug: string) {
    const data = await fetchAPI<ApiProduct>(`/products/${slug}`)
    return normalizeProduct(data)
  },

  async getCategories() {
    const data = await fetchAPI<ApiCategory[]>("/categories")
    return data.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      image: c.image || "",
      count: c._count.products,
    }))
  },

  async getOrders(token: string, params?: { page?: number; limit?: number }) {
    const search = new URLSearchParams()
    if (params?.page) search.set("page", String(params.page))
    if (params?.limit) search.set("limit", String(params.limit))
    const qs = search.toString()
    return fetchAPI<{ orders: any[]; pagination: any }>(`/orders${qs ? `?${qs}` : ""}`, { token })
  },

  async createOrder(token: string, data: { items: { productId: string; quantity: number }[]; addressId: string; paymentMethod: string }) {
    return fetchAPI<{ order: any; payment: any }>("/orders", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    })
  },

  async getCart(token: string) {
    return fetchAPI<{ items: any[] }>("/cart", { token })
  },

  async addToCart(token: string, data: { productId: string; quantity: number }) {
    return fetchAPI<{ items: any[] }>("/cart", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    })
  },

  async removeFromCart(token: string, productId: string) {
    return fetchAPI<{ items: any[] }>(`/cart/${productId}`, {
      method: "DELETE",
      token,
    })
  },
}
