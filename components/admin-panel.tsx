"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import ProductForm from "@/components/product-form"
import ProductsTable from "@/components/products-table"
import { createSupabaseClient } from "@/lib/supabase-client"

interface AdminPanelProps {
  onClose: () => void
  onLogout: () => void
  onProductsUpdated: () => void
  initialShowForm?: boolean
}

export default function AdminPanel({ onClose, onLogout, onProductsUpdated, initialShowForm = false }: AdminPanelProps) {
  const [products, setProducts] = useState<any[]>([])
  const [showForm, setShowForm] = useState(initialShowForm)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseClient()

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    const handleEditProduct = (event: any) => {
      setSelectedProduct(event.detail)
      setShowForm(true)
    }
    window.addEventListener("editProduct", handleEditProduct)
    return () => window.removeEventListener("editProduct", handleEditProduct)
  }, [])

  useEffect(() => {
    if (initialShowForm) {
      setSelectedProduct(null)
      setShowForm(true)
    }
  }, [initialShowForm])

  const loadProducts = async () => {
    setLoading(true)
    const { data } = await supabase.from("laptops").select("*").order("created_at", { ascending: false })
    setProducts(data || [])
    setLoading(false)
  }

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      await supabase.from("laptops").delete().eq("id", id)
      loadProducts()
      onProductsUpdated()
    }
  }

  const handleMarkAsSold = () => {
    loadProducts()
    onProductsUpdated()
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-[90vw] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 border-b shrink-0">
          <div className="flex items-center justify-between w-full">
            <div>
              <DialogTitle>Product Management</DialogTitle>
              <DialogDescription>Manage your laptop catalog - add, edit, or delete products</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div
          className="flex-1 overflow-y-auto p-6"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#45A17D #1a1a1a",
          }}
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              width: 8px;
            }
            div::-webkit-scrollbar-track {
              background: #1a1a1a;
              border-radius: 4px;
            }
            div::-webkit-scrollbar-thumb {
              background: #45A17D;
              border-radius: 4px;
            }
            div::-webkit-scrollbar-thumb:hover {
              background: #50b88c;
            }
          `}</style>
          <div className="space-y-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Product List ({products.length})</h3>
              <Button
                onClick={() => {
                  setSelectedProduct(null)
                  setShowForm(!showForm)
                }}
                className="bg-primary hover:bg-primary/90"
              >
                {showForm ? "Cancel" : "+Add Laptop"}
              </Button>
            </div>

            {showForm && (
              <div className="border border-border rounded-lg p-6 bg-card">
                <ProductForm
                  product={selectedProduct}
                  onSuccess={() => {
                    setShowForm(false)
                    setSelectedProduct(null)
                    loadProducts()
                    onProductsUpdated()
                  }}
                  onCancel={() => {
                    setShowForm(false)
                    setSelectedProduct(null)
                  }}
                />
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="text-muted-foreground">Loading...</div>
              </div>
            ) : products.length > 0 ? (
              <ProductsTable
                products={products}
                onEdit={(product) => {
                  setSelectedProduct(product)
                  setShowForm(true)
                }}
                onDelete={handleDeleteProduct}
                onMarkAsSold={handleMarkAsSold}
              />
            ) : (
              <div className="text-center py-12 text-muted-foreground">No products yet. Add your first one!</div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
