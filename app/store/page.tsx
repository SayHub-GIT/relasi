"use client"

import { useState, useEffect, useCallback } from "react"
import { createSupabaseClient } from "@/lib/supabase-client"
import ProductCard from "@/components/product-card"
import ProductDetailModal from "@/components/product-detail-modal"
import AdminModal from "@/components/admin-modal"
import AdminPanel from "@/components/admin-panel"
import Navbar from "@/components/navbar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"

interface FilterState {
  searchTerm: string
  condition: "all" | "new" | "second"
  status: "all" | "available" | "sold_out"
  minPrice: string
  maxPrice: string
}

export default function StoreCatalog() {
  const [products, setProducts] = useState<any[]>([])
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [theme, setTheme] = useState("dark")
  const supabase = createSupabaseClient()

  const [filters, setFilters] = useState<FilterState>({
    searchTerm: "",
    condition: "all",
    status: "all",
    minPrice: "",
    maxPrice: "",
  })

  const applyFilters = useCallback((products: any[], filters: FilterState) => {
    let filtered = [...products]

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase()
      filtered = filtered.filter(
        (p) => p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term),
      )
    }

    if (filters.condition !== "all") {
      filtered = filtered.filter((p) => p.condition === filters.condition)
    }

    if (filters.status !== "all") {
      filtered = filtered.filter((p) => (filters.status === "available" ? !p.is_sold_out : p.is_sold_out))
    }

    if (filters.minPrice) {
      filtered = filtered.filter((p) => p.price >= Number.parseInt(filters.minPrice))
    }
    if (filters.maxPrice) {
      filtered = filtered.filter((p) => p.price <= Number.parseInt(filters.maxPrice))
    }

    return filtered
  }, [])

  useEffect(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light")
  }, [])

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    const filtered = applyFilters(products, filters)
    setFilteredProducts(filtered)
  }, [filters, products, applyFilters])

  const loadProducts = async () => {
    setLoading(true)
    const { data, error } = await supabase.from("laptops").select("*").order("created_at", { ascending: false })

    if (!error) {
      setProducts(data || [])
    }
    setLoading(false)
  }

  const handleLoginClick = () => {
    setShowAdminModal(true)
  }

  const handleAdminPanelClick = () => {
    setShowAdminPanel(true)
  }

  const handleLoginSuccess = () => {
    setIsAdmin(true)
    setShowAdminModal(false)
    loadProducts()
  }

  const handleLogout = () => {
    setIsAdmin(false)
    setShowAdminPanel(false)
    loadProducts()
  }

  const handleEditProduct = (product: any) => {
    setShowDetail(false)
    setShowAdminModal(true)
    // Pass product to admin modal for editing
    setTimeout(() => {
      const event = new CustomEvent("editProduct", { detail: product })
      window.dispatchEvent(event)
    }, 100)
  }

  if (loading) {
    return (
      <>
        <Navbar
          onLoginClick={handleLoginClick}
          onAdminClick={handleAdminPanelClick}
          onLogoutClick={handleLogout}
          theme={theme}
          setTheme={setTheme}
          isAdmin={isAdmin}
        />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading catalog...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar
        onLoginClick={handleLoginClick}
        onAdminClick={handleAdminPanelClick}
        onLogoutClick={handleLogout}
        theme={theme}
        setTheme={setTheme}
        isAdmin={isAdmin}
      />

      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto p-4 lg:p-8">
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Search laptops by name or specs..."
                value={filters.searchTerm}
                onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                className="pl-10"
              />
            </div>

            {/* Filters - Compact version */}
            <div className="bg-card p-3 rounded-lg border border-border">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 text-sm">
                {/* Condition Filter */}
                <div className="flex gap-1">
                  {["all", "new", "second"].map((cond) => (
                    <Badge
                      key={cond}
                      variant={filters.condition === cond ? "default" : "outline"}
                      className="cursor-pointer text-xs"
                      onClick={() =>
                        setFilters({
                          ...filters,
                          condition: cond as any,
                        })
                      }
                    >
                      {cond === "all" ? "All" : cond === "new" ? "New" : "Second"}
                    </Badge>
                  ))}
                </div>

                {/* Status Filter */}
                <div className="flex gap-1">
                  {["all", "available", "sold_out"].map((status) => (
                    <Badge
                      key={status}
                      variant={filters.status === status ? "default" : "outline"}
                      className="cursor-pointer text-xs"
                      onClick={() =>
                        setFilters({
                          ...filters,
                          status: status as any,
                        })
                      }
                    >
                      {status === "all" ? "All" : status === "available" ? "Available" : "Sold"}
                    </Badge>
                  ))}
                </div>

                {/* Price Filters */}
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  className="text-xs h-8"
                />

                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  className="text-xs h-8"
                />

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setFilters({
                      searchTerm: "",
                      condition: "all",
                      status: "all",
                      minPrice: "",
                      maxPrice: "",
                    })
                  }
                  className="text-xs h-8"
                >
                  Clear
                </Button>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={() => {
                      setSelectedProduct(product)
                      setShowDetail(true)
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No products found matching your filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        open={showDetail}
        onClose={() => setShowDetail(false)}
        onEdit={handleEditProduct}
      />

      {/* Admin Modal */}
      {showAdminModal && (
        <AdminModal
          isLoggedIn={isAdmin}
          onClose={() => setShowAdminModal(false)}
          onLoginSuccess={handleLoginSuccess}
          onLogout={handleLogout}
          onProductsUpdated={loadProducts}
        />
      )}

      {/* Admin Panel */}
      {isAdmin && showAdminPanel && (
        <AdminPanel onClose={() => setShowAdminPanel(false)} onLogout={handleLogout} onProductsUpdated={loadProducts} />
      )}
    </>
  )
}
