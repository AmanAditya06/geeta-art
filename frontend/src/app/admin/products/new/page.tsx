"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useSession } from "next-auth/react"
import { api } from "@/lib/api"
import { ImageUploader } from "@/components/admin/image-uploader"

export default function NewProductPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [form, setForm] = useState({
    name: "",
    slug: "",
    categoryId: "",
    price: "",
    comparePrice: "",
    description: "",
    stock: "",
  })
  const [images, setImages] = useState<string[]>([])
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => {})
  }, [])

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (field === "name") {
      setForm((prev) => ({
        ...prev,
        name: value,
        slug: value.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-"),
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const token = (session?.user as any)?.apiToken
      if (!token) throw new Error("Not authenticated")
      const body = {
        name: form.name,
        slug: form.slug,
        categoryId: form.categoryId,
        price: Number(form.price),
        comparePrice: form.comparePrice ? Number(form.comparePrice) : undefined,
        description: form.description,
        stock: Number(form.stock),
        images,
      }
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      router.push("/admin/products")
    } catch (err: any) {
      alert(err.message || "Failed to save product")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="size-4 mr-1" /> Back
        </Button>
      </div>
      <h1 className="font-serif text-2xl font-bold text-wood-dark mb-6">Add New Product</h1>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" value={form.name} onChange={(e) => handleChange("name", e.target.value)} required className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" value={form.slug} onChange={(e) => handleChange("slug", e.target.value)} required className="mt-1.5" />
            </div>
            <div>
              <Label>Product Images</Label>
              <div className="mt-1.5">
                <ImageUploader images={images} onChange={setImages} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="categoryId">Category</Label>
                <select
                  id="categoryId"
                  value={form.categoryId}
                  onChange={(e) => handleChange("categoryId", e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="comparePrice">Compare At Price (₹)</Label>
                <Input id="comparePrice" type="number" value={form.comparePrice} onChange={(e) => handleChange("comparePrice", e.target.value)} className="mt-1.5" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price (₹)</Label>
                <Input id="price" type="number" value={form.price} onChange={(e) => handleChange("price", e.target.value)} required className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="stock">Stock</Label>
                <Input id="stock" type="number" value={form.stock} onChange={(e) => handleChange("stock", e.target.value)} required className="mt-1.5" />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={form.description} onChange={(e) => handleChange("description", e.target.value)} rows={4} className="mt-1.5" />
            </div>
            <div className="pt-4 flex gap-3">
              <Button type="submit" disabled={saving}>
                <Save className="size-4 mr-1" /> {saving ? "Saving..." : "Save Product"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
