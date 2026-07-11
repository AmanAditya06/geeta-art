"use client"

import { useState, useEffect } from "react"
import { Search, Mail, MoreHorizontal } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useSession } from "next-auth/react"

export default function AdminCustomersPage() {
  const { data: session } = useSession()
  const [search, setSearch] = useState("")
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = (session?.user as any)?.apiToken
    if (!token) { setLoading(false); return }
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setCustomers(data.users || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [session])

  const filtered = customers.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-wood-dark">Customers</h1>
        <p className="text-sm text-gray-500 mt-1">{customers.length} registered customers</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <Input
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 font-semibold text-wood-dark">Customer</th>
                  <th className="text-left py-3 px-2 font-semibold text-wood-dark hidden sm:table-cell">Contact</th>
                  <th className="text-left py-3 px-2 font-semibold text-wood-dark hidden md:table-cell">Orders</th>
                  <th className="text-left py-3 px-2 font-semibold text-wood-dark hidden md:table-cell">Total Spent</th>
                  <th className="text-left py-3 px-2 font-semibold text-wood-dark">Status</th>
                  <th className="text-left py-3 px-2 font-semibold text-wood-dark hidden lg:table-cell">Joined</th>
                  <th className="py-3 px-2"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((customer) => (
                  <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                          {(customer.name || "U").charAt(0)}
                        </div>
                        <p className="font-medium text-wood-dark">{customer.name || "Unknown"}</p>
                      </div>
                    </td>
                    <td className="py-3 px-2 hidden sm:table-cell">
                      <div>
                        <p className="text-gray-600">{customer.email}</p>
                        <p className="text-xs text-gray-400">{customer.phone || "—"}</p>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-gray-600 hidden md:table-cell">{customer._count?.orders || 0}</td>
                    <td className="py-3 px-2 hidden md:table-cell">
                      ₹{(customer.totalSpent || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-2">
                      <Badge variant="success">Active</Badge>
                    </td>
                    <td className="py-3 px-2 text-gray-500 hidden lg:table-cell">{new Date(customer.createdAt).toLocaleDateString("en-IN")}</td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon"><Mail className="size-3.5" /></Button>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="size-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
