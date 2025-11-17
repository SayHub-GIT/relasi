"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createSupabaseClient } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import ProductForm from "@/components/product-form"
import ProductsTable from "@/components/products-table"

export default function AdminDashboard() {
  const [products, setProducts] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createSupabaseClient()

  useEffect(() => {
    const adminSession = localStorage.getItem("admin_session")
    if (!adminSession) {
      router.push("/admin/login")
      return
    }

    loadProducts()
  }, [router])

  const loadProducts = async () => {
    setLoading(true)
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false })

    if (!error) {
      setProducts(data || [])
    }
    setLoading(false)
  }

  const handleDeleteProduct = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id)

    if (!error) {
      loadProducts()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Product Management</h1>
        <Button
          onClick={() => {
            setSelectedProduct(null)
            setShowForm(!showForm)
          }}
          className="bg-primary hover:bg-primary/90"
        >
          {showForm ? "Cancel" : "+ Add Product"}
        </Button>
      </div>

      {showForm && (
        <div className="bg-card rounded-lg border border-border p-6">
          <ProductForm
            product={selectedProduct}
            onSuccess={() => {
              setShowForm(false)
              setSelectedProduct(null)
              loadProducts()
            }}
            onCancel={() => {
              setShowForm(false)
              setSelectedProduct(null)
            }}
          />
        </div>
      )}

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">{products.length} Products</h2>
          {products.length > 0 ? (
            <ProductsTable
              products={products}
              onEdit={(product) => {
                setSelectedProduct(product)
                setShowForm(true)
              }}
              onDelete={handleDeleteProduct}
            />
          ) : (
            <p className="text-muted-foreground text-center py-8">No products yet. Add your first product!</p>
          )}
        </div>
      </div>
    </div>
  )
}
