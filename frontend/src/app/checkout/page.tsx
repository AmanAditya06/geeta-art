"use client"

import { useState, useCallback, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronLeft, CreditCard, ShieldCheck, Truck, MapPin, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"
import { useCart } from "@/store/cart"
import { useSession } from "next-auth/react"

interface AddressForm {
  name: string
  phone: string
  street: string
  city: string
  state: string
  pincode: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { items, total, clearCart } = useCart()
  const [placeing, setPlacing] = useState(false)
  const [address, setAddress] = useState<AddressForm>({
    name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
  })

  useEffect(() => {
    const name = session?.user?.name
    if (name) {
      setAddress((a) => ({ ...a, name }))
    }
  }, [session])

  const handleChange = (field: keyof AddressForm, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }))
  }

  const subtotal = total
  const shipping = subtotal > 50000 ? 0 : 499
  const tax = Math.round(subtotal * 0.18)
  const grandTotal = subtotal + shipping + tax

  const loadRazorpay = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      if ((window as any).Razorpay) { resolve(); return }
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.onload = () => resolve()
      script.onerror = () => reject(new Error("Failed to load Razorpay SDK"))
      document.body.appendChild(script)
    })
  }, [])

  const handlePlaceOrder = async () => {
    if (!session) {
      router.push("/account")
      return
    }
    if (items.length === 0) return
    setPlacing(true)

    try {
      const token = (session.user as any)?.apiToken
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api"

      const res = await fetch(`${apiUrl}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.id, quantity: i.quantity })),
          shippingAddress: address,
          paymentMethod: "razorpay",
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || "Failed to create order")
      }

      const data = await res.json()
      const order = data.order || data

      await loadRazorpay()

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder",
        amount: grandTotal * 100,
        currency: "INR",
        name: "Geeta Art",
        description: "Handcrafted Wooden Furniture",
        order_id: order.razorpayOrderId || order.id,
        handler: async function (response: any) {
          try {
            await fetch(`${apiUrl}/orders/${order.id}/pay`, {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
              }),
            })
            clearCart()
            router.push(`/account?tab=orders&success=true`)
          } catch {
            alert("Payment verification failed. Please contact support.")
          }
        },
        prefill: {
          name: address.name,
          email: session.user?.email || "",
          contact: address.phone,
        },
        theme: { color: "#8B5A2B" },
        modal: {
          ondismiss: () => setPlacing(false),
        },
      }

      const razorpay = new (window as any).Razorpay(options)
      razorpay.on("payment.failed", () => {
        alert("Payment failed. Please try again.")
        setPlacing(false)
      })
      razorpay.open()
    } catch (err: any) {
      alert(err.message || "Something went wrong")
      setPlacing(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h1 className="font-serif text-2xl font-bold text-wood-dark mb-3">Your cart is empty</h1>
        <p className="text-wood-muted mb-8">Add some items before checking out.</p>
        <Link href="/shop"><Button>Go to Shop</Button></Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link href="/cart" className="inline-flex items-center text-sm text-wood-muted hover:text-primary">
          <ChevronLeft className="size-4 mr-1" /> Back to Cart
        </Link>
      </div>
      <h1 className="font-serif text-3xl font-bold text-wood-dark mb-8">Checkout</h1>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <MapPin className="size-5 text-primary" />
                <h2 className="font-serif text-lg font-semibold text-wood-dark">Shipping Address</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={address.name} onChange={(e) => handleChange("name", e.target.value)} placeholder="Enter your full name" className="mt-1.5" />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" value={address.phone} onChange={(e) => handleChange("phone", e.target.value)} placeholder="10-digit mobile number" className="mt-1.5" />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input id="street" value={address.street} onChange={(e) => handleChange("street", e.target.value)} placeholder="House number, street, area" className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" value={address.city} onChange={(e) => handleChange("city", e.target.value)} placeholder="City" className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input id="state" value={address.state} onChange={(e) => handleChange("state", e.target.value)} placeholder="State" className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input id="pincode" value={address.pincode} onChange={(e) => handleChange("pincode", e.target.value)} placeholder="6-digit pincode" className="mt-1.5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <CreditCard className="size-5 text-primary" />
                <h2 className="font-serif text-lg font-semibold text-wood-dark">Payment Method</h2>
              </div>
              <div className="rounded-xl border border-wood-border bg-primary/5 p-4 flex items-center gap-3">
                <CreditCard className="size-6 text-primary" />
                <div>
                  <p className="font-semibold text-wood-dark text-sm">Pay with Razorpay</p>
                  <p className="text-xs text-wood-muted">Credit/Debit Card, UPI, Net Banking, Wallet</p>
                </div>
                <Badge variant="secondary" className="ml-auto">Secure</Badge>
              </div>
            </CardContent>
          </Card>

          <Button size="lg" className="w-full" onClick={handlePlaceOrder} disabled={placeing || !session}>
            {placeing ? (
              <><Loader2 className="size-4 mr-2 animate-spin" /> Processing...</>
            ) : !session ? (
              <><ShieldCheck className="size-4 mr-2" /> Sign in to Place Order</>
            ) : (
              <><ShieldCheck className="size-4 mr-2" /> Place Order - {formatPrice(grandTotal)}</>
            )}
          </Button>
        </div>

        <div className="lg:col-span-2">
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <h2 className="font-serif text-lg font-semibold text-wood-dark mb-4">Order Summary</h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span className="text-wood-muted truncate mr-2">
                      {item.name} <span className="text-xs">x{item.quantity}</span>
                    </span>
                    <span className="font-medium text-wood-dark whitespace-nowrap">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 border-t border-wood-border pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-wood-muted">Subtotal</span>
                  <span className="text-wood-dark">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-wood-muted">Shipping</span>
                  <span className={shipping === 0 ? "text-green-600" : ""}>
                    {shipping === 0 ? "Free" : formatPrice(shipping)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-wood-muted">Tax (18% GST)</span>
                  <span className="text-wood-dark">{formatPrice(tax)}</span>
                </div>
              </div>
              <div className="mt-4 border-t border-wood-border pt-4">
                <div className="flex justify-between text-base">
                  <span className="font-semibold text-wood-dark">Total</span>
                  <span className="font-bold text-primary text-lg">{formatPrice(grandTotal)}</span>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-wood-muted">
                <Truck className="size-3.5" />
                <span>Estimated delivery: 5-7 business days</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
