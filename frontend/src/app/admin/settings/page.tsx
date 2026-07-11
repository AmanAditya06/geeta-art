"use client"

import { useEffect, useState } from "react"
import { Save } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSession } from "next-auth/react"
import { handleImageError } from "@/lib/placeholders"
import { ImageUploader } from "@/components/admin/image-uploader"

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export default function AdminSettingsPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [logoImage, setLogoImage] = useState<string[]>([])
  const [siteName, setSiteName] = useState("Geeta Art")
  const [heroOverlayImage, setHeroOverlayImage] = useState<string[]>([])

  useEffect(() => {
    fetch(`${API}/settings`)
      .then((r) => r.json())
      .then((data) => {
        if (data.logo_url) setLogoImage([data.logo_url])
        if (data.site_name) setSiteName(data.site_name)
        if (data.hero_overlay_image) setHeroOverlayImage([data.hero_overlay_image])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const token = (session?.user as any)?.apiToken
      if (!token) throw new Error("Not authenticated")
      await fetch(`${API}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          logo_url: logoImage[0] || "",
          site_name: siteName,
          hero_overlay_image: heroOverlayImage[0] || "",
        }),
      })
      alert("Settings saved successfully!")
    } catch (err: any) {
      alert(err.message || "Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-20 text-gray-500">Loading settings...</div>
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-wood-dark">Site Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your website branding and logo</p>
      </div>

      <form onSubmit={handleSave}>
        <Card>
          <CardHeader>
            <CardTitle>Branding</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>Website Logo</Label>
              <p className="text-xs text-gray-400 mt-0.5 mb-2">Upload your logo image (displayed in header and footer)</p>
              <ImageUploader images={logoImage} onChange={setLogoImage} maxFiles={1} />
            </div>
            <div>
              <Label htmlFor="siteName">Site Name</Label>
              <Input id="siteName" value={siteName} onChange={(e) => setSiteName(e.target.value)} className="mt-1.5" />
            </div>
            <div className="pt-2">
              <Button type="submit" disabled={saving}>
                <Save className="size-4 mr-1" /> {saving ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Hero Section</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Hero Overlay Image</Label>
            <p className="text-xs text-gray-400 mt-0.5 mb-2">The furniture image displayed on the right side of the homepage hero (replaces default SVG)</p>
            <ImageUploader images={heroOverlayImage} onChange={setHeroOverlayImage} maxFiles={1} />
          </div>
          <div className="pt-2">
            <Button onClick={async () => {
              setSaving(true)
              try {
                const token = (session?.user as any)?.apiToken
                await fetch(`${API}/settings`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                  body: JSON.stringify({ hero_overlay_image: heroOverlayImage[0] || "" }),
                })
                alert("Hero image saved!")
              } catch { alert("Failed to save") }
              finally { setSaving(false) }
            }} disabled={saving}>
              <Save className="size-4 mr-1" /> Save Hero Image
            </Button>
          </div>
        </CardContent>
      </Card>

      {logoImage[0] && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 p-4 border rounded-lg bg-gray-50">
              <img src={logoImage[0]} alt="Logo" className="h-10 object-contain" onError={(e) => handleImageError(e, "logo")} />
              <span className="font-serif text-lg font-bold text-wood-dark">{siteName}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
