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
}

export default function AdminPanel({ onClose, onLogout, onProductsUpdated }: AdminPanelProps) {
  const [products, setProducts] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseClient()

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setLoading(true)
    const { data } = await supabase.from("laptops").select("*").order("created_at", { ascending: false })
    setProducts(data || [])
    setLoading(false)
  }

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm("Yakin ingin menghapus produk ini?")) {
      await supabase.from("laptops").delete().eq("id", id)
      loadProducts()
      onProductsUpdated()
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b">
          <div className="flex items-center justify-between w-full">
            <div>
              <DialogTitle>Manajemen Laptop</DialogTitle>
              <DialogDescription>Tambah, edit, atau hapus produk laptop dari katalog Anda</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:#45A17D_#1a1a1a] pr-4">
          <style>{`
            .admin-panel-scroll::-webkit-scrollbar {
              width: 8px;
            }
            .admin-panel-scroll::-webkit-scrollbar-track {
              background: #1a1a1a;
              border-radius: 4px;
            }
            .admin-panel-scroll::-webkit-scrollbar-thumb {
              background: #45A17D;
              border-radius: 4px;
            }
            .admin-panel-scroll::-webkit-scrollbar-thumb:hover {
              background: #50b88c;
            }
          `}</style>
          <div className="admin-panel-scroll space-y-6">
            <div className="flex items-center justify-between sticky top-0 bg-background py-2 z-10">
              <h3 className="text-lg font-semibold">Produk ({products.length})</h3>
              <Button
                onClick={() => {
                  setSelectedProduct(null)
                  setShowForm(!showForm)
                }}
                className="bg-primary hover:bg-primary/90"
              >
                {showForm ? "Batal" : "+ Tambah Laptop"}
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
              />
            ) : (
              <div className="text-center py-12 text-muted-foreground">Belum ada produk. Tambahkan yang pertama!</div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
