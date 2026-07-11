"use client"

import { type ReactNode, useState, useEffect } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { SessionProvider, useSession } from "next-auth/react"
import { Toaster } from "@/components/ui/toast"
import { useCart } from "@/store/cart"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

function splitCartItemId(id: string): { productId: string; variantId?: string } {
  const parts = id.split("-")
  if (parts.length >= 2) {
    return { productId: parts[0], variantId: parts.slice(1).join("-") }
  }
  return { productId: id }
}

function CartSync() {
  const { data: session, status } = useSession()
  const { items, clearCart } = useCart()

  useEffect(() => {
    if (status !== "authenticated" || !session) return
    if (items.length === 0) return

    const token = (session.user as any)?.apiToken
    if (!token) return

    const synced = sessionStorage.getItem("geeta-cart-synced")
    if (synced === "true") return

    const syncItems = async () => {
      for (const item of items) {
        const { productId, variantId } = splitCartItemId(item.id)
        try {
          await fetch(`${API_BASE}/cart`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ productId, variantId, quantity: item.quantity }),
          })
        } catch {
          // item sync failed, continue with others
        }
      }
      clearCart()
      sessionStorage.setItem("geeta-cart-synced", "true")
    }

    syncItems()
  }, [status, session, items, clearCart])

  return null
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  )

  return (
    <SessionProvider>
      <CartSync />
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster />
      </QueryClientProvider>
    </SessionProvider>
  )
}
