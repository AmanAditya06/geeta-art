import { create } from "zustand"
import { persist } from "zustand/middleware"

interface WishlistItem {
  id: string
  name: string
  price: number
  image: string
  slug: string
}

interface WishlistStore {
  items: WishlistItem[]
  toggle: (item: WishlistItem) => void
  has: (id: string) => boolean
}

export const useWishlist = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (item) =>
        set((state) => {
          const exists = state.items.find((i) => i.id === item.id)
          return {
            items: exists
              ? state.items.filter((i) => i.id !== item.id)
              : [...state.items, item],
          }
        }),
      has: (id) => get().items.some((i) => i.id === id),
    }),
    { name: "geeta-wishlist" }
  )
)
