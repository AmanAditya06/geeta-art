"use client"

import { useEffect, useState } from "react"
import { Plus, Edit3, Trash2, X, Save } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useSession } from "next-auth/react"
import { handleImageError } from "@/lib/placeholders"
import { ImageUploader } from "@/components/admin/image-uploader"

interface Banner {
  id: string
  title: string
  subtitle: string | null
  image: string
  link: string | null
  active: boolean
  order: number
}

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export default function AdminBannersPage() {
  const { data: session } = useSession()
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Banner | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: "", subtitle: "", image: "", link: "", active: true, order: 0 })
  const [uploadedImages, setUploadedImages] = useState<string[]>([])

  const fetchBanners = () => {
    fetch(`${API}/banners`)
      .then((r) => r.json())
      .then((data) => setBanners(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchBanners() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ title: "", subtitle: "", image: "", link: "", active: true, order: 0 })
    setUploadedImages([])
    setShowModal(true)
  }

  const openEdit = (b: Banner) => {
    setEditing(b)
    setForm({ title: b.title, subtitle: b.subtitle || "", image: b.image, link: b.link || "", active: b.active, order: b.order })
    setUploadedImages(b.image ? [b.image] : [])
    setShowModal(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const token = (session?.user as any)?.apiToken
      if (!token) throw new Error("Not authenticated")
      const body = {
        title: form.title,
        subtitle: form.subtitle || null,
        image: uploadedImages[0] || form.image,
        link: form.link || null,
        active: form.active,
        order: Number(form.order),
      }
      const method = editing ? "PUT" : "POST"
      const url = editing ? `${API}/banners/${editing.id}` : `${API}/banners`
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error("Failed to save banner")
      setShowModal(false)
      setEditing(null)
      fetchBanners()
    } catch (err: any) {
      alert(err.message || "Failed to save banner")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return
    try {
      const token = (session?.user as any)?.apiToken
      await fetch(`${API}/banners/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchBanners()
    } catch {
      alert("Failed to delete banner")
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-2xl font-bold text-wood-dark">Banners</h1>
          <p className="text-sm text-gray-500 mt-1">Manage homepage hero banners</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4 mr-1" /> Add Banner
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading banners...</div>
      ) : banners.length === 0 ? (
        <div className="text-center py-10 text-gray-500">No banners found. Create one to get started.</div>
      ) : (
        <div className="space-y-4">
          {banners.map((banner, index) => (
            <Card key={banner.id}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="size-20 shrink-0 rounded-xl overflow-hidden bg-gray-100">
                  {banner.image ? (
                    <img src={banner.image} alt={banner.title} className="size-full object-cover" onError={(e) => handleImageError(e, "banner")} />
                  ) : (
                    <div className="size-full flex items-center justify-center">
                      <span className="font-serif text-2xl font-bold text-gray-300">{index + 1}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-wood-dark">{banner.title}</h3>
                  <p className="text-sm text-gray-500 truncate">{banner.subtitle || "No subtitle"}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Order: {banner.order}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={banner.active ? "success" : "secondary"}>
                    {banner.active ? "Active" : "Inactive"}
                  </Badge>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(banner)}><Edit3 className="size-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(banner.id)}><Trash2 className="size-3.5" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{editing ? "Edit Banner" : "Add Banner"}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}><X className="size-4" /></Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Input id="subtitle" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label>Image</Label>
                  <div className="mt-1">
                    <ImageUploader images={uploadedImages} onChange={setUploadedImages} maxFiles={1} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="link">Link URL</Label>
                    <Input id="link" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className="mt-1" placeholder="/shop" />
                  </div>
                  <div>
                    <Label htmlFor="order">Order</Label>
                    <Input id="order" type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} className="mt-1" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="active" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="rounded" />
                  <Label htmlFor="active" className="mb-0">Active</Label>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={saving}>
                    <Save className="size-4 mr-1" /> {saving ? "Saving..." : "Save"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
