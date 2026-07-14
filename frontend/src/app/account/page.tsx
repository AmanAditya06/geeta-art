"use client"

import { Suspense, useEffect, useState, FormEvent } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useSession, signIn } from "next-auth/react"
import {
  Package, User, MapPin, Heart, Clock, ChevronRight,
  Edit3, Plus, Trash2, ShoppingBag, Loader2, Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { handleImageError, getProductFallback } from "@/lib/placeholders"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { formatPrice, cn } from "@/lib/utils"
import { useCart } from "@/store/cart"
import { useWishlist } from "@/store/wishlist"

const statusColors: Record<string, "success" | "warning" | "default" | "destructive"> = {
  delivered: "success",
  shipped: "warning",
  processing: "default",
  pending: "warning",
  cancelled: "destructive",
}

interface OrderData {
  id: string
  total: number
  status: string
  createdAt: string
  items?: { quantity: number }[]
}

function AccountContent() {
  const searchParams = useSearchParams()
  const tab = searchParams.get("tab") || "orders"
  const { data: session } = useSession()
  const [signingIn, setSigningIn] = useState(false)
  const [signInError, setSignInError] = useState("")
  const [creds, setCreds] = useState({ email: "", password: "" })
  const { addItem } = useCart()
  const { items: wishlistItems, toggle: toggleWishlist } = useWishlist()
  const [addedToCartIds, setAddedToCartIds] = useState<Set<string>>(new Set())
  const [orders, setOrders] = useState<OrderData[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [profileLoading, setProfileLoading] = useState(true)

  const token = (session?.user as any)?.apiToken
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api"

  useEffect(() => {
    if (!token) { setOrdersLoading(false); setProfileLoading(false); return }
    if (tab === "orders" || tab === "profile" || tab === "addresses") {
      fetch(`${apiUrl}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((d) => { setProfile(d); if (tab === "orders") {
          fetch(`${apiUrl}/orders`, { headers: { Authorization: `Bearer ${token}` } })
            .then((r) => r.json())
            .then((o) => setOrders(Array.isArray(o) ? o : o.orders || []))
        }})
        .catch(() => {})
        .finally(() => { setProfileLoading(false); setOrdersLoading(false) })
    }
  }, [token, tab, apiUrl])

  if (!session) {
    const handleSignIn = async (e: FormEvent) => {
      e.preventDefault()
      setSigningIn(true)
      setSignInError("")
      const result = await signIn("credentials", { ...creds, redirect: false })
      if (result?.error) {
        setSignInError("Invalid email or password")
        setSigningIn(false)
      } else {
        window.location.reload()
      }
    }
    return (
      <div className="mx-auto max-w-md py-20">
        <div className="text-center mb-8">
          <User className="size-16 mx-auto text-primary/60" />
          <h1 className="font-serif text-2xl font-bold text-wood-dark mt-4">Sign In</h1>
          <p className="text-wood-muted text-sm mt-1">Access your account & orders</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={creds.email} onChange={(e) => setCreds({ ...creds, email: e.target.value })} className="mt-1.5" required />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={creds.password} onChange={(e) => setCreds({ ...creds, password: e.target.value })} className="mt-1.5" required />
              </div>
              {signInError && <p className="text-sm text-red-500">{signInError}</p>}
              <Button type="submit" className="w-full" disabled={signingIn}>
                {signingIn ? <><Loader2 className="size-4 mr-2 animate-spin" /> Signing in...</> : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
        <p className="text-xs text-wood-muted text-center mt-4">
          Don&apos;t have an account? Contact the administrator.
        </p>
      </div>
    )
  }

  return (<>
      {tab === "orders" && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl font-bold text-wood-dark">My Orders</h2>
            <Badge variant="secondary">{orders.length} orders</Badge>
          </div>
          {ordersLoading ? (
            <div className="text-center py-10 text-wood-muted">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-10">
              <Package className="size-12 mx-auto text-wood-muted/30 mb-3" />
              <p className="text-wood-muted">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <Card key={order.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-4">
                        <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
                          <Package className="size-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-wood-dark text-sm">{order.id.slice(0, 8)}</p>
                          <p className="text-xs text-wood-muted flex items-center gap-1 mt-0.5">
                            <Clock className="size-3" /> {new Date(order.createdAt).toLocaleDateString("en-IN")} &middot; {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold text-wood-dark">{formatPrice(order.total)}</p>
                          <Badge variant={statusColors[order.status] || "default"} className="mt-1 capitalize">
                            {order.status}
                          </Badge>
                        </div>
                        <ChevronRight className="size-4 text-wood-muted" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "profile" && (
        <div>
          <h2 className="font-serif text-2xl font-bold text-wood-dark mb-6">My Profile</h2>
          {profileLoading ? (
            <div className="text-center py-10 text-wood-muted">Loading profile...</div>
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label>Name</Label>
                    <Input value={session?.user?.name || ""} className="mt-1.5" readOnly />
                  </div>
                  <div className="sm:col-span-2">
                    <Label>Email</Label>
                    <Input value={session?.user?.email || ""} className="mt-1.5" readOnly />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input value={profile?.phone || ""} className="mt-1.5" readOnly />
                  </div>
                  <div>
                    <Label>Role</Label>
                    <Input value={(session?.user as any)?.role || "user"} className="mt-1.5" readOnly />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {tab === "addresses" && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl font-bold text-wood-dark">My Addresses</h2>
            <Button size="sm">
              <Plus className="size-4 mr-1" /> Add Address
            </Button>
          </div>
          {profileLoading ? (
            <div className="text-center py-10 text-wood-muted">Loading addresses...</div>
          ) : !profile?.addresses?.length ? (
            <div className="text-center py-10">
              <MapPin className="size-12 mx-auto text-wood-muted/30 mb-3" />
              <p className="text-wood-muted">No saved addresses</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {profile.addresses.map((addr: any, i: number) => (
                <Card key={addr.id || i}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="size-4 text-primary" />
                        <h3 className="font-semibold text-wood-dark text-sm">{addr.label || `Address ${i + 1}`}</h3>
                      </div>
                      {addr.isDefault && <Badge variant="secondary" className="text-[10px]">Default</Badge>}
                    </div>
                    <p className="text-sm text-wood-muted">
                      {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                    {addr.phone && <p className="text-sm text-wood-muted mt-1">{addr.phone}</p>}
                    <div className="mt-3 flex gap-2">
                      <Button variant="ghost" size="sm"><Edit3 className="size-3 mr-1" /> Edit</Button>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600"><Trash2 className="size-3 mr-1" /> Remove</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "wishlist" && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl font-bold text-wood-dark">My Wishlist</h2>
            <Badge variant="secondary">{wishlistItems.length} items</Badge>
          </div>
          {wishlistItems.length === 0 ? (
            <div className="text-center py-10">
              <Heart className="size-12 mx-auto text-wood-muted/30 mb-3" />
              <p className="text-wood-muted">Your wishlist is empty</p>
            </div>
          ) : (
            <div className="space-y-3">
              {wishlistItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="size-14 shrink-0 rounded-xl bg-wood-border/20 flex items-center justify-center overflow-hidden">
                        <img src={item.image || getProductFallback()} alt={item.name} className="size-full object-cover" onError={(e) => handleImageError(e, "product")} />
                      </div>
                      <div>
                        <Link href={`/products/${item.slug}`} className="hover:text-primary transition-colors">
                          <h3 className="font-medium text-wood-dark text-sm">{item.name}</h3>
                        </Link>
                        <p className="text-sm text-wood-muted">{formatPrice(item.price)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        className={cn(addedToCartIds.has(item.id) && "bg-green-600 hover:bg-green-700")}
                        onClick={() => {
                          addItem({ id: item.id, name: item.name, price: item.price, image: item.image, slug: item.slug })
                          setAddedToCartIds((prev) => new Set(prev).add(item.id))
                          setTimeout(() => setAddedToCartIds((prev) => { const next = new Set(prev); next.delete(item.id); return next }), 2000)
                        }}
                      >
                        {addedToCartIds.has(item.id) ? <><Check className="size-3.5 mr-1" /> Added</> : <><ShoppingBag className="size-3 mr-1" /> Add to Cart</>}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => toggleWishlist(item)}>
                        <Trash2 className="size-3.5 text-wood-muted" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-wood-muted">Loading...</div>}>
      <AccountContent />
    </Suspense>
  )
}
