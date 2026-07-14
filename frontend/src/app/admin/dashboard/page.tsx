"use client"

import { useState, useEffect } from "react"
import {
  TrendingUp,
  ShoppingBag,
  Package,
  AlertTriangle,
  Download,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"
import { api } from "@/lib/api"
import { useSession } from "next-auth/react"
import Link from "next/link"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const statusColors: Record<string, "success" | "warning" | "default" | "destructive" | "secondary"> = {
  delivered: "success",
  shipped: "warning",
  processing: "default",
  pending: "secondary",
  cancelled: "destructive",
}

export default function AdminDashboardPage() {
  const { data: session } = useSession()
  const [products, setProducts] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = (session?.user as any)?.apiToken

    Promise.all([
      api.getProducts().then((r) => setProducts(r.products as any)),
      token
        ? fetch(`${process.env.NEXT_PUBLIC_API_URL || "/api"}/orders/admin`, {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then((r) => r.ok ? r.json() : { orders: [] })
            .then((d) => setOrders(d.orders || []))
            .catch(() => {})
        : Promise.resolve(),
    ]).finally(() => setLoading(false))
  }, [session])

  const totalProducts = products.length
  const totalStock = products.reduce((sum: number, p: any) => sum + p.stock, 0)
  const lowStock = products.filter((p: any) => p.stock > 0 && p.stock <= 5)
  const outOfStock = products.filter((p: any) => p.stock === 0)
  const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.total || 0), 0)

  const chartData = (() => {
    const monthMap: Record<string, number> = {}
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    months.forEach((m) => { monthMap[m] = 0 })
    orders.forEach((o: any) => {
      const d = new Date(o.createdAt)
      const month = months[d.getMonth()]
      monthMap[month] = (monthMap[month] || 0) + (o.total || 0)
    })
    return months.map((name) => ({ name, revenue: monthMap[name] || 0 }))
  })()

  const stats = [
    { label: "Total Revenue", value: totalRevenue, icon: TrendingUp, color: "text-green-600" },
    { label: "Total Orders", value: orders.length, icon: ShoppingBag, color: "text-blue-600" },
    { label: "Total Products", value: totalProducts, icon: Package, color: "text-purple-600" },
    { label: "Low Stock Items", value: lowStock.length, icon: AlertTriangle, color: "text-amber-600" },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl font-bold text-wood-dark">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back! Here&apos;s what&apos;s happening with your store.
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="size-3.5 mr-1" /> Download Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="size-5 text-primary" />
                  </div>
                </div>
                <p className="mt-4 text-2xl font-bold text-wood-dark">
                  {stat.label === "Total Revenue" ? formatPrice(stat.value) : stat.value.toLocaleString("en-IN")}
                </p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        {/* Sales Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8D5C4" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#6B5B4F" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#6B5B4F" />
                  <Tooltip
                    contentStyle={{
                      background: "#FFF8F0",
                      border: "1px solid #E8D5C4",
                      borderRadius: "8px",
                    }}
                    formatter={(value) => [formatPrice(Number(value)), "Revenue"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8B5A2B"
                    strokeWidth={2}
                    dot={{ fill: "#8B5A2B", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-4">
            <AlertTriangle className="size-5 text-amber-500" />
            <CardTitle>Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStock.slice(0, 5).map((product: any) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between rounded-lg border border-wood-border p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-wood-dark">{product.name}</p>
                    <p className="text-xs text-gray-500">
                      {product.stock} remaining
                    </p>
                  </div>
                  <Badge variant="destructive">{product.stock}</Badge>
                </div>
              ))}
              {lowStock.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No low stock items</p>
              )}
            </div>
            <Link href="/admin/products" className="block mt-4">
              <Button variant="ghost" size="sm" className="w-full">
                View All Products
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle>Recent Orders</CardTitle>
          <Link href="/admin/orders">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-wood-border">
                  <th className="text-left py-3 px-2 font-semibold text-wood-dark">Order</th>
                  <th className="text-left py-3 px-2 font-semibold text-wood-dark">Customer</th>
                  <th className="text-left py-3 px-2 font-semibold text-wood-dark hidden sm:table-cell">Items</th>
                  <th className="text-left py-3 px-2 font-semibold text-wood-dark">Total</th>
                  <th className="text-left py-3 px-2 font-semibold text-wood-dark">Status</th>
                  <th className="text-left py-3 px-2 font-semibold text-wood-dark hidden md:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      No orders yet. Orders will appear here once customers start purchasing.
                    </td>
                  </tr>
                ) : (
                  orders.slice(0, 5).map((order: any) => (
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
