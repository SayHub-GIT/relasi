"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface UserWithRole {
  uid: string
  email: string
  role?: string
}

export function useAuth() {
  const [user, setUser] = useState<UserWithRole | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Simulasi auth local (hardcode credential)
  const LOCAL_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL
  const LOCAL_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD

  useEffect(() => {
    const checkSession = () => {
      const storedUser = localStorage.getItem("localUser")

      if (storedUser) {
        const parsed = JSON.parse(storedUser)
        setUser(parsed)
        fetchUserRole(parsed.uid)
      } else {
        setUser(null)
        setUserRole(null)
      }

      setLoading(false)
    }

    checkSession()
  }, [])

  const fetchUserRole = async (userId: string) => {
    try {
      const response = await fetch(`/api/get-user-role?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setUserRole(data.role || null)
      }
    } catch (error) {
      console.error("[v0] Error fetching user role:", error)
    }
  }

  const login = async (email: string, password: string) => {
    if (email === LOCAL_EMAIL && password === LOCAL_PASSWORD) {
      const fakeUser = {
        uid: "local-admin",
        email,
      }

      localStorage.setItem("localUser", JSON.stringify(fakeUser))
      setUser(fakeUser)
      await fetchUserRole(fakeUser.uid)
      return { success: true }
    }

    return { success: false, message: "Invalid credential" }
  }

  const logout = async () => {
    localStorage.removeItem("localUser")
    setUser(null)
    setUserRole(null)
    router.push("/")
  }

  return {
    user,
    userRole,
    loading,
    isAdmin: userRole === "admin",
    isUser: userRole === "user",
    login,
    logout,
  }
}
