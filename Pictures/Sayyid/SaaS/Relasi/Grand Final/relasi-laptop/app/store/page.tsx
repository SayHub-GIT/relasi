"use client"

import { useState, useEffect, useCallback } from "react"
import { createSupabaseClient } from "@/lib/supabase-client"
import ProductCard from "@/components/product-card"
import ProductDetailModal from "@/components/product-detail-modal"
import AdminModal from "@/components/admin-modal"
import AdminPanel from "@/components/admin-panel"
import Navbar from "@/components/navbar"
import SalesLogModal from "@/components/sales-log-modal"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"

interface FilterState {
  searchTerm: string
  condition: "all" | "new" | "second"
  status: "all" | "available" | "sold_out"
  priceRange: string
}

export default function StoreCatalog() {
  const [products, setProducts] = useState<any[]>([])
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [adminPanelInitialForm, setAdminPanelInitialForm] = useState(false) // State untuk mengontrol mode buka panel
  const [showSalesLog, setShowSalesLog] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [theme, setTheme] = useState("dark")
  const supabase = createSupabaseClient()

  const [filters, setFilters] = useState<FilterState>({
    searchTerm: "",
    condition: "all",
    status: "all",
    priceRange: "all",
  })

  const priceRanges = [
    { value: "all", label: "All Prices" },
    { value: "3-4", label: "Rp 3m - 4m" },
    { value: "4-5", label: "Rp 4m - 5m" },
    { value: "5-6", label: "Rp 5m - 6m" },
    { value: "6-7", label: "Rp 6m - 7m" },
    { value: "7-8", label: "Rp 7m - 8m" },
    { value: "8-9", label: "Rp 8m - 9m" },
    { value: "9-10", label: "Rp 9m - 10m" },
    { value: "10-12", label: "Rp 10m - 12m" },
    { value: "12-15", label: "Rp 12m - 15m" },
    { value: "15+", label: "Rp 15m+" },
  ]

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

    if (filters.priceRange && filters.priceRange !== "all") {
      const range = filters.priceRange
      if (range === "15+") {
        filtered = filtered.filter((p) => p.price >= 15000000)
      } else {
        const [min, max] = range.split("-").map((v) => Number.parseInt(v) * 1000000)
        filtered = filtered.filter((p) => p.price >= min && p.price < max)
      }
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
    setAdminPanelInitialForm(true)
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
    setAdminPanelInitialForm(false)
    setShowAdminPanel(true)
    // Trigger event untuk memilih produk (atau bisa diimprove lewat props jika AdminPanel mendukung)
    setTimeout(() => {
      const event = new CustomEvent("editProduct", { detail: product })
      window.dispatchEvent(event)
    }, 100)
  }

  useEffect(() => {
    const checkSession = async () => {
      const { isAdminLoggedIn, isSessionValid } = await import("@/lib/admin-auth")
      if (isAdminLoggedIn() && isSessionValid()) {
        setIsAdmin(true)
      }
    }
    checkSession()
  }, [])

  if (loading) {
    return (
      <>
        <Navbar
          onLoginClick={handleLoginClick}
          onAdminClick={handleAdminPanelClick}
          onSalesLogClick={() => setShowSalesLog(true)}
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
        onSalesLogClick={() => setShowSalesLog(true)}
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

                {/* Price Range Dropdown */}
                <select
                  value={filters.priceRange}
                  onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
                  className="text-xs h-8 bg-background border border-input rounded-md px-2"
                >
                  {priceRanges.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setFilters({
                      searchTerm: "",
                      condition: "all",
                      status: "all",
                      priceRange: "all",
                    })
                  }
                  className="text-xs h-8 col-span-2 md:col-span-1"
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
        <AdminPanel
          onClose={() => setShowAdminPanel(false)}
          onLogout={handleLogout}
          onProductsUpdated={loadProducts}
          initialShowForm={adminPanelInitialForm} // Teruskan prop initialShowForm
        />
      )}

      {/* Sales Log Modal */}
      <SalesLogModal open={showSalesLog} onClose={() => setShowSalesLog(false)} />
    </>
  )
}
