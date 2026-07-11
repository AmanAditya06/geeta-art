import type { Metadata } from "next"
import AccountSidebar from "./account-sidebar"

export const metadata: Metadata = {
  title: "My Account - Geeta Art",
  description: "Manage your account, orders, and addresses.",
}

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl font-bold text-wood-dark mb-8">My Account</h1>
      <div className="grid gap-8 lg:grid-cols-4">
        <AccountSidebar />
        <div className="lg:col-span-3">{children}</div>
      </div>
    </div>
  )
}
