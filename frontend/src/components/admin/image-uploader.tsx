"use client"

import { useState, useRef } from "react"
import { Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import { handleImageError } from "@/lib/placeholders"

interface ImageUploaderProps {
  images: string[]
  onChange: (urls: string[]) => void
  maxFiles?: number
}

export function ImageUploader({ images, onChange, maxFiles = 5 }: ImageUploaderProps) {
  const { data: session } = useSession()
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const token = (session?.user as any)?.apiToken
      const formData = new FormData()
      formData.append("image", file)
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/upload`,
        {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        },
      )
      if (!res.ok) throw new Error("Upload failed")
      const data = await res.json()
      onChange([...images, data.url])
    } catch {
      alert("Failed to upload image")
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {images.map((url, i) => (
          <div key={i} className="relative size-24 rounded-lg border border-gray-200 overflow-hidden group">
            <img
              src={url}
              alt={`Image ${i + 1}`}
              className="size-full object-cover"
              onError={(e) => handleImageError(e, "product")}
            />
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="absolute top-1 right-1 size-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="size-3" />
            </button>
          </div>
        ))}
        {images.length < maxFiles && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="size-24 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary transition-colors flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-primary disabled:opacity-50"
          >
            <Upload className="size-5" />
            <span className="text-[10px]">{uploading ? "Uploading..." : "Upload"}</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  )
}
