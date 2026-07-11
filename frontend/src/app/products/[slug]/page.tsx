import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { fetchProductBySlug, fetchAllProducts } from "@/lib/fetch-products"
import ProductDetailClient from "./product-detail-client"
import type { Product } from "@/components/product-card"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await fetchProductBySlug(slug)
  if (!product) return { title: "Product Not Found" }
  return {
    title: `${product.name} - Geeta Art`,
    description: `Buy ${product.name} at Geeta Art. Premium handcrafted wooden furniture. ₹${product.price.toLocaleString("en-IN")}. Free delivery.`,
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params
  const [product, allProducts] = await Promise.all([
    fetchProductBySlug(slug),
    fetchAllProducts(),
  ])
  if (!product) notFound()

  const related = allProducts.products
    .filter((p: any) => p.category === (product as any).category && p.id !== (product as any).id)
    .slice(0, 4)

  return <ProductDetailClient product={product as any as Product} relatedProducts={related as any as Product[]} />
}
