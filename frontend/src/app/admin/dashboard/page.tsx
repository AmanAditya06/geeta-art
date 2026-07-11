"use client"

import { useState, useEffect } from "react"
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Users,
  AlertTriangle,
  MoreHorizontal,
  Download,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"
import { api } from "@/lib/api"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const chartData = [
  { name: "Jan", revenue: 85000 },
  { name: "Feb", revenue: 92000 },
  { name: "Mar", revenue: 78000 },
  { name: "Apr", revenue: 101000 },
  { name: "May", revenue: 95000 },
  { name: "Jun", revenue: 112000 },
  { name: "Jul", revenue: 125000 },
  { name: "Aug", revenue: 108000 },
  { name: "Sep", revenue: 135000 },
  { name: "Oct", revenue: 142000 },
  { name: "Nov", revenue: 128000 },
  { name: "Dec", revenue: 158000 },
]

export default function AdminDashboardPage() {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "12m">("12m")
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.getProducts().then((r) => setProducts(r.products as any)),
    ]).finally(() => setLoading(false))
  }, [])

  const totalProducts = products.length
  const totalStock = products.reduce((sum: number, p: any) => sum + p.stock, 0)
  const lowStock = products.filter((p: any) => p.stock > 0 && p.stock <= 5)
  const outOfStock = products.filter((p: any) => p.stock === 0)

  const stats = [
    { label: "Total Products", value: totalProducts, icon: Package, change: "", color: "text-blue-600" },
    { label: "Total Stock", value: totalStock, icon: TrendingUp, change: "", color: "text-green-600" },
    { label: "Low Stock Items", value: lowStock.length, icon: AlertTriangle, change: "", color: "text-amber-600" },
    { label: "Out of Stock", value: outOfStock.length, icon: ShoppingBag, change: "", color: "text-red-600" },
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
                  {stat.change && <Badge variant="success" className="text-[10px]">{stat.change}</Badge>}
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
            <div className="flex gap-1">
              {(["7d", "30d", "12m"] as const).map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? "default" : "ghost"}
                  size="sm"
                  className="text-xs"
                  onClick={() => setTimeRange(range)}
                >
                  {range}
                </Button>
              ))}
            </div>
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
            <Button variant="ghost" size="sm" className="w-full mt-4">
              View All Products
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle>Recent Orders</CardTitle>
          <Button variant="outline" size="sm">View All</Button>
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
                  <th className="py-3 px-2"></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    No orders yet. Orders will appear here once customers start purchasing.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
