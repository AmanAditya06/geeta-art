"use client"

import { Suspense } from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { signOut } from "next-auth/react"
import { Package, User, MapPin, Heart, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

const tabs = [
  { href: "/account", label: "My Orders", icon: Package },
  { href: "/account?tab=profile", label: "My Profile", icon: User },
  { href: "/account?tab=addresses", label: "My Addresses", icon: MapPin },
  { href: "/account?tab=wishlist", label: "Wishlist", icon: Heart },
]

function SidebarContent() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentTab = searchParams.get("tab") || "orders"

  const isActive = (href: string) => {
    if (href === "/account" && !searchParams.get("tab")) return true
    return href.includes(`tab=${currentTab}`)
  }

  return (
    <nav className="space-y-1">
      {tabs.map((tab) => {
        const Icon = tab.icon
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
              isActive(tab.href)
                ? "bg-primary/10 text-primary"
                : "text-wood-muted hover:bg-cream hover:text-wood-dark"
            )}
          >
            <Icon className="size-4" />
            {tab.label}
          </Link>
        )
      })}
      <button
        onClick={async () => { await signOut({ redirect: false }); window.location.href = "/" }}
        className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-wood-muted hover:bg-cream hover:text-red-500 transition-colors cursor-pointer"
      >
        <LogOut className="size-4" />
        Sign Out
      </button>
    </nav>
  )
}

export default function AccountSidebar() {
  return (
    <Suspense fallback={<nav className="space-y-1"><div className="h-10 rounded-lg bg-wood-border/20 animate-pulse" /></nav>}>
      <SidebarContent />
    </Suspense>
  )
}
