"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createSupabaseClient } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, Sparkles } from "lucide-react"

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
      keyboard: "",
      camera: "",
      ports: "",
      weight: "",
    },
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [uploadingImage, setUploadingImage] = useState(false)
  const [aiText, setAiText] = useState("")
  const [showAiInput, setShowAiInput] = useState(false)
  const [parsingAi, setParsingAi] = useState(false)
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
        specs: {
          processor: product.specs?.processor || "",
          ram: product.specs?.ram || "",
          storage: product.specs?.storage || "",
          display: product.specs?.display || "",
          gpu: product.specs?.gpu || "",
          keyboard: product.specs?.keyboard || "",
          camera: product.specs?.camera || "",
          ports: product.specs?.ports || "",
          weight: product.specs?.weight || "",
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

  const handleAiParse = async () => {
    if (!aiText.trim()) {
      setError("Please paste laptop data to parse")
      return
    }

    setParsingAi(true)
    setError(null)

    try {
      console.log("[v0] Parsing text locally:", aiText)

      const response = await fetch("/api/ai/parse-laptop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: aiText }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to parse laptop data")
      }

      const { data } = result
      console.log("[v0] AI parsed data received:", data)

      setFormData({
        name: data.name || "",
        description: data.description || "",
        price: data.price?.toString() || "",
        condition: data.condition || "new",
        year: data.year || new Date().getFullYear(),
        is_sold_out: false,
        image_url: formData.image_url,
        specs: {
          processor: data.processor || "",
          ram: data.ram || "",
          storage: data.storage || "",
          display: data.display || "",
          gpu: data.gpu || "",
          keyboard: data.keyboard || "",
          camera: data.camera || "",
          ports: data.ports || "",
          weight: data.weight || "",
        },
      })

      setShowAiInput(false)
      setAiText("")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to parse laptop data"
      console.error("[v0] AI parse error:", errorMessage)
      setError(errorMessage)
    } finally {
      setParsingAi(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!formData.name || !formData.price) {
        throw new Error("Laptop name and price must be filled")
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

        // If it was marked as sold out and it wasn't before, log to sales_log
        if (formData.is_sold_out && !product.is_sold_out) {
          await supabase.from("sales_log").insert([
            {
              laptop_id: product.id,
              laptop_name: formData.name,
              price: Number.parseFloat(formData.price.toString()),
              activity_type: "SOLD",
            },
          ])
        }
      } else {
        // Create
        const { data, error: insertError } = await supabase.from("laptops").insert([submitData]).select()

        if (insertError) {
          console.error("[v0] Insert error:", insertError)
          throw insertError
        }

        console.log("[v0] Successfully inserted:", data)

        // Log to sales_log
        if (data && data[0]) {
          await supabase.from("sales_log").insert([
            {
              laptop_id: data[0].id,
              laptop_name: data[0].name,
              price: data[0].price,
              activity_type: "ADD",
            },
          ])

          if (formData.is_sold_out) {
            await supabase.from("sales_log").insert([
              {
                laptop_id: data[0].id,
                laptop_name: data[0].name,
                price: data[0].price,
                activity_type: "SOLD",
              },
            ])
          }
        }
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
    <form onSubmit={handleSubmit} className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">{product?.id ? "Edit Laptop" : "Add New Laptop"}</h2>

        {/* AI Quick Fill button */}
        {!product?.id && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAiInput(!showAiInput)}
            className="gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Quick Fill (Auto-Parse)
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* AI input section */}
      {showAiInput && (
        <div className="p-4 space-y-3 rounded-lg border-2 border-primary/20 bg-primary/5">
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <Sparkles className="w-4 h-4" />
            <span>AI Quick Fill - Paste your laptop data</span>
          </div>
          <textarea
            placeholder="Paste laptop description here... e.g.:

Lenovo ThinkPad T14s
Spesifikasi:
# Intel® Core™ i5 Gen 10
# Memory 16GB DDR4
# SSD 512GB M.2 PCIe® NVMe
..."
            value={aiText}
            onChange={(e) => setAiText(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
            rows={8}
          />
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleAiParse}
              disabled={parsingAi || !aiText.trim()}
              className="bg-primary hover:bg-primary/90 gap-2"
            >
              {parsingAi ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Parsing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Parse & Fill Form
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAiInput(false)
                setAiText("")
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Image and Basic Info */}
        <div className="space-y-4">
          {/* Image Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Laptop Image</label>
            <div className="flex flex-col gap-3">
              {imagePreview && (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border bg-muted">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
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
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Laptop Name</label>
              <Input
                type="text"
                name="name"
                placeholder="e.g., Lenovo IdeaPad Gaming 3"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Year</label>
                <Input
                  type="number"
                  name="year"
                  placeholder="2024"
                  value={formData.year}
                  onChange={handleChange}
                  min="2000"
                  max={new Date().getFullYear() + 1}
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
                  <option value="second">Second Hand</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Price (IDR)</label>
                <Input
                  type="number"
                  name="price"
                  placeholder="15000000"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Status</label>
                <div className="flex items-center min-h-10 px-3 py-2 border border-border rounded-md bg-background overflow-hidden">
                  <input
                    type="checkbox"
                    id="is_sold_out"
                    name="is_sold_out"
                    checked={formData.is_sold_out}
                    onChange={handleChange}
                    className="w-4 h-4 cursor-pointer accent-primary shrink-0"
                  />
                  <label
                    htmlFor="is_sold_out"
                    className="ml-2 text-sm text-foreground cursor-pointer select-none leading-none whitespace-nowrap"
                  >
                    Sold 
                  </label>
                </div>
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
          </div>
        </div>

        {/* Right Column - Specifications */}
        <div className="space-y-4">
          <div className="space-y-3 p-4 rounded-lg border border-border bg-card">
            <label className="text-sm font-semibold text-foreground">Specifications</label>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Processor</label>
                <Input
                  type="text"
                  placeholder="e.g., Intel Core i5-11320H (Gen 11th)"
                  value={formData.specs.processor}
                  onChange={(e) => handleSpecChange("processor", e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">RAM</label>
                <Input
                  type="text"
                  placeholder="e.g., 8GB DDR4 (Upto 32gb)"
                  value={formData.specs.ram}
                  onChange={(e) => handleSpecChange("ram", e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Storage</label>
                <Input
                  type="text"
                  placeholder="e.g., 512GB M.2 PCIe NVMe"
                  value={formData.specs.storage}
                  onChange={(e) => handleSpecChange("storage", e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Display</label>
                <Input
                  type="text"
                  placeholder="e.g., 15.6 Full HD IPS"
                  value={formData.specs.display}
                  onChange={(e) => handleSpecChange("display", e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">GPU</label>
                <Input
                  type="text"
                  placeholder="e.g., NVIDIA GeForce RTX 2050 4GB"
                  value={formData.specs.gpu}
                  onChange={(e) => handleSpecChange("gpu", e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Keyboard</label>
                <Input
                  type="text"
                  placeholder="e.g., Backlit Keyboard"
                  value={formData.specs.keyboard}
                  onChange={(e) => handleSpecChange("keyboard", e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Camera</label>
                <Input
                  type="text"
                  placeholder="e.g., HD 720p"
                  value={formData.specs.camera}
                  onChange={(e) => handleSpecChange("camera", e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Ports</label>
                <Input
                  type="text"
                  placeholder="e.g., USB 3.2, HDMI 2.0, RJ-45"
                  value={formData.specs.ports}
                  onChange={(e) => handleSpecChange("ports", e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Weight</label>
                <Input
                  type="text"
                  placeholder="e.g., 2.2 kg"
                  value={formData.specs.weight}
                  onChange={(e) => handleSpecChange("weight", e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
          {loading ? "Saving..." : product?.id ? "Save Changes" : "Save New Product"}
        </Button>
      </div>
    </form>
  )
}
