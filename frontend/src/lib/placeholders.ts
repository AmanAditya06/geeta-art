const CATEGORY_PLACEHOLDERS: Record<string, string> = {
  sofas: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop",
  "dining-tables": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=600&fit=crop",
  chairs: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&h=600&fit=crop",
  beds: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=600&fit=crop",
  cabinets: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&h=600&fit=crop",
  shelves: "https://images.unsplash.com/photo-1597072689227-888de0e2a15b?w=600&h=600&fit=crop",
}

const logoFallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="12" fill="#8B6B4D"/>
  <text x="50" y="68" text-anchor="middle" fill="#ffffff" font-family="serif" font-size="48" font-weight="bold">G</text>
</svg>`

function toDataUri(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export const PLACEHOLDER = {
  product: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&h=600&fit=crop",
  banner: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1400&h=600&fit=crop",
  logo: toDataUri(logoFallbackSvg),
  heroOverlay: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop",
  story: "https://images.unsplash.com/photo-1581539250439-c96689b516dd?w=800&h=800&fit=crop",
  mission: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&h=800&fit=crop",
}

export const TEAM_PLACEHOLDERS = [
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1597072689227-888de0e2a15b?w=400&h=400&fit=crop",
]

export function getHeroOverlayFallback(): string {
  return PLACEHOLDER.heroOverlay
}

export function getTeamFallback(index: number): string {
  return TEAM_PLACEHOLDERS[index % TEAM_PLACEHOLDERS.length]
}

export function getProductFallback(categorySlug?: string): string {
  if (categorySlug && CATEGORY_PLACEHOLDERS[categorySlug]) {
    return CATEGORY_PLACEHOLDERS[categorySlug]
  }
  return PLACEHOLDER.product
}

export function getCategoryFallback(slug: string): string {
  return CATEGORY_PLACEHOLDERS[slug] || PLACEHOLDER.product
}

export function handleImageError(e: React.SyntheticEvent<HTMLImageElement>, type: keyof typeof PLACEHOLDER = "product", categorySlug?: string) {
  const img = e.currentTarget
  if (!img.dataset.fallbackAttempted) {
    img.dataset.fallbackAttempted = "true"
    img.src = categorySlug ? getProductFallback(categorySlug) : PLACEHOLDER[type]
  }
}
