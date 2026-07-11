"use client"

import { useState, useEffect } from "react"
import { Plus, Edit3, Trash2, Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { fetchCategories } from "@/lib/fetch-products"

export default function AdminCategoriesPage() {
  const [search, setSearch] = useState("")
  const [categories, setCategories] = useState<{ name: string; slug: string; description: string; image: string; count: number }[]>([])

  useEffect(() => {
    fetchCategories().then(setCategories)
  }, [])

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-2xl font-bold text-wood-dark">Categories</h1>
          <p className="text-sm text-gray-500 mt-1">{categories.length} categories</p>
        </div>
        <Button>
          <Plus className="size-4 mr-1" /> Add Category
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <Input
              placeholder="Search categories..."
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
                  <th className="text-left py-3 px-2 font-semibold text-wood-dark">Category</th>
                  <th className="text-left py-3 px-2 font-semibold text-wood-dark hidden sm:table-cell">Slug</th>
                  <th className="text-left py-3 px-2 font-semibold text-wood-dark hidden md:table-cell">Products</th>
                  <th className="text-left py-3 px-2 font-semibold text-wood-dark">Status</th>
                  <th className="py-3 px-2"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((cat) => (
                  <tr key={cat.slug} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        <div className="size-10 shrink-0 rounded-lg bg-gradient-to-br from-primary/10 to-accent/5 flex items-center justify-center">
                          <div className="text-primary/30">
                            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-wood-dark">{cat.name}</p>
                          <p className="text-xs text-gray-500">{cat.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-gray-600 hidden sm:table-cell">{cat.slug}</td>
                    <td className="py-3 px-2 hidden md:table-cell">
                      <Badge variant="secondary">{cat.count}</Badge>
                    </td>
                    <td className="py-3 px-2">
                      <Badge variant="success">Active</Badge>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon"><Edit3 className="size-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="text-red-500"><Trash2 className="size-3.5" /></Button>
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
