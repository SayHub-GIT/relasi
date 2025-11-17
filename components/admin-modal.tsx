"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { verifyAdminCredentials, setAdminSessionClient, clearAdminSessionClient } from "@/lib/admin-auth"
import ProductForm from "@/components/product-form"
import ProductsTable from "@/components/products-table"
import { createSupabaseClient } from "@/lib/supabase-client"

interface AdminModalProps {
  isLoggedIn: boolean
  onClose: () => void
  onLoginSuccess: () => void
  onLogout: () => void
  onProductsUpdated: () => void
}

export default function AdminModal({
  isLoggedIn,
  onClose,
  onLoginSuccess,
  onLogout,
  onProductsUpdated,
}: AdminModalProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [productsLoading, setProductsLoading] = useState(true)
  const supabase = createSupabaseClient()

  useEffect(() => {
    if (isLoggedIn) {
      loadProducts()
    }
  }, [isLoggedIn])

  useEffect(() => {
    const handleEditProduct = (event: any) => {
      setSelectedProduct(event.detail)
      setShowForm(true)
    }
    window.addEventListener("editProduct", handleEditProduct)
    return () => window.removeEventListener("editProduct", handleEditProduct)
  }, [])

  const loadProducts = async () => {
    setProductsLoading(true)
    const { data } = await supabase.from("laptops").select("*").order("created_at", { ascending: false })
    setProducts(data || [])
    setProductsLoading(false)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (verifyAdminCredentials(email, password)) {
      setAdminSessionClient()
      setEmail("")
      setPassword("")
      loadProducts()
      onLoginSuccess()
    } else {
      setError("Invalid credentials. Please try again.")
    }

    setLoading(false)
  }

  const handleLogout = () => {
    clearAdminSessionClient()
    setShowForm(false)
    setSelectedProduct(null)
    setProducts([])
    onLogout()
  }

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      await supabase.from("laptops").delete().eq("id", id)
      loadProducts()
      onProductsUpdated()
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isLoggedIn ? "Product Management" : "Admin Login"}</DialogTitle>
          <DialogDescription>
            {isLoggedIn
              ? "Manage your laptop catalog - add, edit, or delete products"
              : "Enter your admin credentials to access product management"}
          </DialogDescription>
        </DialogHeader>

        {!isLoggedIn ? (
          <form onSubmit={handleLogin} className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="admin@relasi.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2 justify-end pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
                {loading ? "Logging in..." : "Login"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Products ({products.length})</h3>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setSelectedProduct(null)
                    setShowForm(!showForm)
                  }}
                  className="bg-primary hover:bg-primary/90"
                >
                  {showForm ? "Cancel" : "+ Add Product"}
                </Button>
                <Button type="button" variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
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

            {productsLoading ? (
              <div className="flex justify-center py-8">
                <div className="text-muted-foreground">Loading products...</div>
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
              <div className="text-center py-8 text-muted-foreground">No products yet. Add your first laptop!</div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
