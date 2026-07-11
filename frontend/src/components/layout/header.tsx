"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Search, Heart, ShoppingCart, User, Menu, X, ChevronDown, Phone, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useCart } from "@/store/cart"
import { useSession, signOut } from "next-auth/react"
import { SearchModal } from "@/components/search-modal"
import { handleImageError } from "@/lib/placeholders"

const categories = [
  { name: "All", href: "/shop" },
  { name: "Sofas", href: "/shop?category=sofas" },
  { name: "Dining Tables", href: "/shop?category=dining-tables" },
  { name: "Chairs", href: "/shop?category=chairs" },
  { name: "Beds", href: "/shop?category=beds" },
  { name: "Cabinets", href: "/shop?category=cabinets" },
  { name: "Shelves", href: "/shop?category=shelves" },
]

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [shopOpen, setShopOpen] = useState(false)
  const shopTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const [userOpen, setUserOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [logoUrl, setLogoUrl] = useState("")
  const [siteName, setSiteName] = useState("Geeta Art")
  const userRef = useRef<HTMLDivElement>(null)
  const { data: session } = useSession()
  const itemCount = useCart((s) => s.itemCount)

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/settings`)
      .then((r) => r.json())
      .then((data) => {
        if (data.logo_url) setLogoUrl(data.logo_url)
        if (data.site_name) setSiteName(data.site_name)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-cream border-b border-wood-border">
      {/* Top bar */}
      <div className="hidden sm:flex items-center justify-between bg-primary px-4 py-1.5 text-xs text-cream">
        <span>Free Shipping on orders over ₹499</span>
        <a href="tel:+919999999999" className="flex items-center gap-1 hover:underline">
          <Phone className="h-3 w-3" />
          +91 99999 99999
        </a>
      </div>

      {/* Main bar */}
      <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
        {/* Mobile menu toggle */}
        <button
          className="sm:hidden p-2 text-wood-dark"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          {logoUrl ? (
            <img src={logoUrl} alt={siteName} className="h-8 object-contain" onError={(e) => handleImageError(e, "logo")} />
          ) : (
            <span className="text-2xl font-serif font-bold text-primary tracking-wide hover:text-primary-dark transition-colors">
              {siteName}
            </span>
          )}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium text-wood-dark hover:text-primary transition-colors">
            Home
          </Link>
          <div
            className="relative"
            onMouseEnter={() => { if (shopTimer.current) clearTimeout(shopTimer.current); setShopOpen(true) }}
            onMouseLeave={() => { shopTimer.current = setTimeout(() => setShopOpen(false), 200) }}
          >
            <button
              onClick={() => setShopOpen((v) => !v)}
              onMouseEnter={() => { if (shopTimer.current) clearTimeout(shopTimer.current) }}
              className="flex items-center gap-1 text-sm font-medium text-wood-dark hover:text-primary transition-colors cursor-pointer"
            >
              Shop
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", shopOpen && "rotate-180")} />
            </button>
            {shopOpen && (
              <div
                onMouseEnter={() => { if (shopTimer.current) clearTimeout(shopTimer.current) }}
                onMouseLeave={() => { shopTimer.current = setTimeout(() => setShopOpen(false), 200) }}
                className="absolute top-full left-0 mt-2 w-56 rounded-lg border border-wood-border bg-white shadow-lg py-2 z-50"
              >
                {categories.map((cat) => (
                  <Link
                    key={cat.name}
                    href={cat.href}
                    onClick={(e) => { e.stopPropagation(); if (shopTimer.current) clearTimeout(shopTimer.current); setShopOpen(false) }}
                    className="block px-4 py-2 text-sm text-wood-dark hover:bg-cream hover:text-primary transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link href="/about" className="text-sm font-medium text-wood-dark hover:text-primary transition-colors">
            About
          </Link>
          <Link href="/contact" className="text-sm font-medium text-wood-dark hover:text-primary transition-colors">
            Contact
          </Link>
        </nav>

        {/* Icons */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Search" onClick={() => setSearchOpen(true)}>
            <Search className="h-5 w-5" />
          </Button>
          <Link href="/account?tab=wishlist">
            <Button variant="ghost" size="icon" aria-label="Wishlist">
              <Heart className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/cart" className="relative">
            <Button variant="ghost" size="icon" aria-label="Cart">
              <ShoppingCart className="h-5 w-5" />
            </Button>
            {itemCount > 0 && (
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]">
                {itemCount > 99 ? "99+" : itemCount}
              </Badge>
            )}
          </Link>
          <div className="relative" ref={userRef}>
            <Button variant="ghost" size="icon" aria-label="Account" onClick={() => setUserOpen(!userOpen)}>
              <User className="h-5 w-5" />
            </Button>
            {userOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-wood-border bg-white shadow-lg py-2">
                {session ? (
                  <>
                    <Link href="/account" className="block px-4 py-2 text-sm text-wood-dark hover:bg-cream" onClick={() => setUserOpen(false)}>
                      My Account
                    </Link>
                    {(session.user as any)?.role === "admin" && (
                      <Link href="/admin" className="block px-4 py-2 text-sm text-wood-dark hover:bg-cream" onClick={() => setUserOpen(false)}>
                        Admin Panel
                      </Link>
                    )}
                    <hr className="my-1 border-wood-border" />
                    <button onClick={() => { setUserOpen(false); signOut({ callbackUrl: "/" }) }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-cream">
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </>
                ) : (
                  <Link href="/account" className="block px-4 py-2 text-sm text-wood-dark hover:bg-cream" onClick={() => setUserOpen(false)}>
                    Sign In
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-wood-border bg-cream px-4 pb-4">
          <nav className="flex flex-col gap-2 pt-2">
            <Link href="/" className="py-2 text-sm font-medium text-wood-dark" onClick={() => setMobileOpen(false)}>
              Home
            </Link>
            <div className="py-2">
              <p className="text-sm font-medium text-wood-dark mb-2">Shop</p>
              <div className="flex flex-col gap-1 pl-3">
                {categories.map((cat) => (
                  <Link
                    key={cat.name}
                    href={cat.href}
                    className="py-1.5 text-sm text-wood-muted hover:text-primary"
                    onClick={() => setMobileOpen(false)}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
            <Link href="/about" className="py-2 text-sm font-medium text-wood-dark" onClick={() => setMobileOpen(false)}>
              About
            </Link>
            <Link href="/contact" className="py-2 text-sm font-medium text-wood-dark" onClick={() => setMobileOpen(false)}>
              Contact
            </Link>
          </nav>
        </div>
      )}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  )
}
