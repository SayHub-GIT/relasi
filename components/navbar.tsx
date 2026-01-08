"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Moon, Sun, LogOut, BarChart3 } from "lucide-react"
import { clearAdminSessionClient } from "@/lib/admin-auth"

interface NavbarProps {
  onLoginClick: () => void
  onLogoutClick: () => void
  onAdminClick: () => void
  onSalesLogClick: () => void
  theme: string
  setTheme: (theme: string) => void
  isAdmin: boolean
}

export default function Navbar({
  onLoginClick,
  onLogoutClick,
  onAdminClick,
  onSalesLogClick,
  theme,
  setTheme,
  isAdmin,
}: NavbarProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    document.documentElement.classList.toggle("dark")
  }

  const handleLogout = () => {
    clearAdminSessionClient()
    onLogoutClick()
  }

  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img
            src={theme === "dark" ? "R-Dark.png" : "R-Light.png"}
            alt="Relasi Store Logo"
            className="w-10 h-10 object-contain"
          />
          <h1 className="text-xl font-bold text-foreground">Relasi Store</h1>
        </div>

        {/* Right side - Dark mode and Login/Admin */}
        <div className="flex items-center gap-4">
          {isAdmin && (
            <>
              <Button onClick={onSalesLogClick} className="bg-primary hover:bg-primary/90">
                <BarChart3 className="w-4 h-4 mr-2" />
                Sales Log
              </Button>
              <Button onClick={onAdminClick} className="bg-primary hover:bg-primary/90">
                +Add Laptop
              </Button>
            </>
          )}

          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-foreground" />
            ) : (
              <Moon className="w-5 h-5 text-foreground" />
            )}
          </button>

          {isAdmin ? (
            <div className="flex items-center gap-3">
              <div className="text-right">
             <p className="text-sm font-medium text-foreground">Admin</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleLogout}
                className="text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          ) : (
            <Button onClick={onLoginClick} className="bg-primary hover:bg-primary/90">
              Login
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
}
