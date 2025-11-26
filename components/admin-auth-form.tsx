"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AdminAuthForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Local hardcode credentials (pakai env biar aman)
  const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL
  const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validate admin login locally
      if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
        throw new Error("Invalid email or password")
      }

      // Fake user uid untuk ambil role
      const FAKE_UID = "local-admin"

      // Check admin role
      const response = await fetch(`/api/get-user-role?userId=${FAKE_UID}`)
      if (!response.ok) {
        throw new Error("Failed to verify admin role")
      }

      const data = await response.json()
      if (data.role !== "admin") {
        throw new Error("Only admin accounts can login here")
      }

      // Save session locally
      document.cookie = `localUid=${FAKE_UID}; path=/; secure; samesite=strict`
      document.cookie = `localEmail=${email}; path=/; secure; samesite=strict`

      router.push("/admin")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      setError(errorMessage)
      console.error("[v0] Admin auth error:", errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h1 className="text-2xl font-bold text-center mb-2">Admin Login</h1>
        <p className="text-center text-muted-foreground text-sm mb-6">Restricted access for administrators only</p>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Logging in..." : "Admin Login"}
        </Button>

        <div className="text-center">
          <a href="/" className="text-sm text-primary hover:underline">
            Back to Home
          </a>
        </div>
      </form>
    </div>
  )
}
