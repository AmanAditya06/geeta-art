"use client"

import { useState, useEffect } from "react"
import { Plus, Edit3, Trash2, Search, X, Save } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useSession } from "next-auth/react"
import { fetchCategories } from "@/lib/fetch-products"

interface Category {
  name: string
  slug: string
  description: string
  image: string
  count: number
}

export default function AdminCategoriesPage() {
  const { data: session } = useSession()
  const [search, setSearch] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSlug, setEditingSlug] = useState<string | null>(null)
  const [form, setForm] = useState({ name: "", slug: "", description: "" })
  const [saving, setSaving] = useState(false)

  const loadCategories = () => {
    fetchCategories()
      .then(setCategories)
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = (session?.user as any)?.apiToken
    if (!token) return
    setSaving(true)

    try {
      const apiUrl = "/api"
      const method = editingSlug ? "PUT" : "POST"
      const url = editingSlug ? `${apiUrl}/categories/${editingSlug}` : `${apiUrl}/categories`

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || "Failed to save category")
      }

      setShowForm(false)
      setEditingSlug(null)
      setForm({ name: "", slug: "", description: "" })
      loadCategories()
    } catch (err: any) {
      alert(err.message || "Failed to save category")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (slug: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return
    const token = (session?.user as any)?.apiToken
    if (!token) return

    try {
      const res = await fetch(`/api/categories/${slug}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || "Failed to delete")
      }
      loadCategories()
    } catch (err: any) {
      alert(err.message || "Failed to delete category")
    }
  }

  const startEdit = (cat: Category) => {
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || "" })
    setEditingSlug(cat.slug)
    setShowForm(true)
  }

  const startNew = () => {
    setForm({ name: "", slug: "", description: "" })
    setEditingSlug(null)
    setShowForm(true)
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-2xl font-bold text-wood-dark">Categories</h1>
          <p className="text-sm text-gray-500 mt-1">{categories.length} categories</p>
        </div>
        <Button onClick={startNew}>
          <Plus className="size-4 mr-1" /> Add Category
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <h3 className="font-semibold text-wood-dark">{editingSlug ? "Edit Category" : "New Category"}</h3>
            <Button variant="ghost" size="icon" onClick={() => { setShowForm(false); setEditingSlug(null) }}>
              <X className="size-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cat-name">Name</Label>
                  <Input id="cat-name" value={form.name} onChange={(e) => {
                    const name = e.target.value
                    setForm((p) => ({
                      ...p,
                      name,
                      slug: editingSlug ? p.slug : name.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-"),
                    }))
                  }} required className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="cat-slug">Slug</Label>
                  <Input id="cat-slug" value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} required className="mt-1.5" disabled={!!editingSlug} />
                </div>
              </div>
              <div>
                <Label htmlFor="cat-desc">Description</Label>
                <Input id="cat-desc" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className="mt-1.5" placeholder="Optional description" />
              </div>
              <div className="flex gap-3">
                <Button type="submit" disabled={saving}>
                  <Save className="size-4 mr-1" /> {saving ? "Saving..." : editingSlug ? "Update" : "Create"}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingSlug(null) }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

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
                          <p className="text-xs text-gray-500">{cat.description || "No description"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-gray-600 hidden sm:table-cell">{cat.slug}</td>
                    <td className="py-3 px-2 hidden md:table-cell">
                      <Badge variant="secondary">{cat.count}</Badge>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => startEdit(cat)}>
                          <Edit3 className="size-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(cat.slug)}>
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500">No categories found.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
