"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createSupabaseClient } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload } from "lucide-react"

interface ProductFormProps {
  product?: any
  onSuccess: () => void
  onCancel: () => void
}

export default function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    condition: "new",
    year: new Date().getFullYear(),
    is_sold_out: false,
    image_url: "",
    specs: {
      processor: "",
      ram: "",
      storage: "",
      display: "",
      gpu: "",
    },
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [uploadingImage, setUploadingImage] = useState(false)
  const supabase = createSupabaseClient()

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price || "",
        condition: product.condition || "new",
        year: product.year || new Date().getFullYear(),
        is_sold_out: product.is_sold_out || false,
        image_url: product.image_url || "",
        specs: product.specs || {
          processor: "",
          ram: "",
          storage: "",
          display: "",
          gpu: "",
        },
      })
      setImagePreview(product.image_url || "")
    }
  }, [product])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSpecChange = (spec: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      specs: { ...prev.specs, [spec]: value },
    }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB")
      return
    }

    setUploadingImage(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const { url } = await response.json()
      setFormData((prev) => ({ ...prev, image_url: url }))
      setImagePreview(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image")
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!formData.name || !formData.price) {
        throw new Error("Laptop name dan price harus diisi")
      }

      const submitData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number.parseFloat(formData.price.toString()),
        condition: formData.condition,
        year: Number.parseInt(formData.year.toString()),
        is_sold_out: formData.is_sold_out,
        image_url: formData.image_url || null,
        specs: formData.specs,
      }

      console.log("[v0] Submitting laptop data:", submitData)

      if (product?.id) {
        // Update
        const { error: updateError } = await supabase.from("laptops").update(submitData).eq("id", product.id)

        if (updateError) {
          console.error("[v0] Update error:", updateError)
          throw updateError
        }
      } else {
        // Create
        const { data, error: insertError } = await supabase.from("laptops").insert([submitData]).select()

        if (insertError) {
          console.error("[v0] Insert error:", insertError)
          throw insertError
        }

        console.log("[v0] Successfully inserted:", data)
      }

      onSuccess()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      console.error("[v0] Submit error:", errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <h2 className="text-2xl font-bold text-foreground">{product?.id ? "Edit Laptop" : "Add New Laptop"}</h2>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {/* Image Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Laptop Image</label>
          <div className="flex flex-col gap-3">
            {imagePreview && (
              <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border">
                <img src={imagePreview || "/placeholder.svg"} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
            <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
              <Upload className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {uploadingImage ? "Uploading..." : "Click to upload image"}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Laptop Name</label>
            <Input
              type="text"
              name="name"
              placeholder="e.g., MacBook Pro 14"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Year</label>
            <Input
              type="number"
              name="year"
              placeholder="e.g., 2024"
              value={formData.year}
              onChange={handleChange}
              min="2000"
              max={new Date().getFullYear() + 1}
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Description</label>
          <textarea
            name="description"
            placeholder="Detailed description of the laptop..."
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            rows={4}
            required
          />
        </div>

        {/* Price and Condition */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Price (IDR)</label>
            <Input
              type="number"
              name="price"
              placeholder="e.g., 20000000"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Condition</label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="new">New</option>
              <option value="second">Second</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Sold Out</label>
            <div className="flex items-center h-10 px-3 border border-border rounded-md bg-background">
              <input
                type="checkbox"
                name="is_sold_out"
                checked={formData.is_sold_out}
                onChange={handleChange}
                className="w-5 h-5 cursor-pointer"
              />
              <span className="ml-2 text-sm text-foreground">Mark as sold out</span>
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div className="space-y-3 p-4 rounded-lg border border-border bg-card">
          <label className="text-sm font-semibold text-foreground">Specifications</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.keys(formData.specs).map((key) => (
              <div key={key} className="space-y-1">
                <label className="text-xs text-muted-foreground capitalize">{key}</label>
                <Input
                  type="text"
                  placeholder={`e.g., ${key === "processor" ? "Intel Core i7" : key === "ram" ? "16GB" : ""}`}
                  value={formData.specs[key as keyof typeof formData.specs]}
                  onChange={(e) => handleSpecChange(key, e.target.value)}
                  className="text-sm"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
          {loading ? "Saving..." : product?.id ? "Update" : "Add"} Laptop
        </Button>
      </div>
    </form>
  )
}
