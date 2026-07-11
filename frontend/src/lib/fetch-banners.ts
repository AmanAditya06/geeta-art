const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api"

export interface BannerData {
  id: string
  title: string
  subtitle: string | null
  image: string
  link: string | null
  active: boolean
  order: number
}

export async function fetchBanners(): Promise<BannerData[]> {
  try {
    const res = await fetch(`${API_BASE}/banners`, { next: { revalidate: 60 }, signal: AbortSignal.timeout(5000) })
    if (!res.ok) throw new Error("Failed to fetch")
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}
