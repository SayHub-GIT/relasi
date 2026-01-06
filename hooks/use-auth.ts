"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getFirebaseAuth, getFirebaseApp } from "@/lib/firebase-client"
import { onAuthStateChanged, signOut, type User } from "firebase/auth"

interface UserWithRole extends User {
  role?: string
}

export function useAuth() {
  const [user, setUser] = useState<UserWithRole | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const auth = getFirebaseAuth()

  getFirebaseApp()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser as UserWithRole)
        // Fetch user role from Supabase
        await fetchUserRole(firebaseUser.uid)
      } else {
        setUser(null)
        setUserRole(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [auth])

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

  const logout = async () => {
    try {
      await signOut(auth)
      setUser(null)
      setUserRole(null)
      router.push("/")
    } catch (error) {
      console.error("[v0] Logout error:", error)
    }
  }

  return {
    user,
    userRole,
    loading,
    isAdmin: userRole === "admin",
    isUser: userRole === "user",
    logout,
  }
}
