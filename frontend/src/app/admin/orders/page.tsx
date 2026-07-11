"use client"

import { useState, useEffect } from "react"
import { Search, MoreHorizontal } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"
import { useSession } from "next-auth/react"

const statusColors: Record<string, "success" | "warning" | "default" | "destructive" | "secondary"> = {
  delivered: "success",
  shipped: "warning",
  processing: "default",
  pending: "secondary",
  cancelled: "destructive",
}

export default function AdminOrdersPage() {
  const { data: session } = useSession()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    const token = (session?.user as any)?.apiToken
    if (!token) { setLoading(false); return }
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/admin`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setOrders(data.orders || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [session])

  const filtered = orders.filter((o) => {
    const matchesSearch = String(o.id).toLowerCase().includes(search.toLowerCase()) ||
      (o.user?.name || "").toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || o.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-wood-dark">Orders</h1>
        <p className="text-sm text-gray-500 mt-1">Manage customer orders</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="Search by order ID or customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 font-semibold text-wood-dark">Order ID</th>
                  <th className="text-left py-3 px-2 font-semibold text-wood-dark">Customer</th>
                  <th className="text-left py-3 px-2 font-semibold text-wood-dark hidden sm:table-cell">Items</th>
                  <th className="text-left py-3 px-2 font-semibold text-wood-dark">Total</th>
                  <th className="text-left py-3 px-2 font-semibold text-wood-dark">Status</th>
                  <th className="text-left py-3 px-2 font-semibold text-wood-dark hidden md:table-cell">Date</th>
                  <th className="py-3 px-2"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order: any) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-2 font-medium text-wood-dark">{order.id.slice(0, 8)}</td>
                    <td className="py-3 px-2 text-gray-600">{order.user?.name || "N/A"}</td>
                    <td className="py-3 px-2 text-gray-600 hidden sm:table-cell">{order.items?.length || 0}</td>
                    <td className="py-3 px-2 font-medium text-wood-dark">{formatPrice(order.total)}</td>
                    <td className="py-3 px-2">
                      <Badge variant={statusColors[order.status] || "default"} className="capitalize">
                        {order.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 text-gray-500 hidden md:table-cell">{new Date(order.createdAt).toLocaleDateString("en-IN")}</td>
                    <td className="py-3 px-2">
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500">No orders found.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
