"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { clearAdminSession } from "@/lib/admin-auth"

export default function AdminHeader() {
  const router = useRouter()

  const handleLogout = () => {
    clearAdminSession()
    router.push("/")
  }

  return (
    <header className="bg-primary text-primary-foreground border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Relasi Store Admin</h1>
        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="gap-2 bg-transparent text-primary-foreground hover:bg-primary/80"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </header>
  )
}
