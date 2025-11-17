"use client"

const ADMIN_CREDENTIALS = {
  email: process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@relasi.com",
  password: process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin123",
}

export function verifyAdminCredentials(email: string, password: string): boolean {
  return email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password
}

export function setAdminSessionClient(): void {
  if (typeof window !== "undefined") {
    sessionStorage.setItem("admin_session", "true")
  }
}

export function clearAdminSessionClient(): void {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("admin_session")
  }
}

export const setAdminSession = setAdminSessionClient
export const clearAdminSession = clearAdminSessionClient

export function isAdminLoggedIn(): boolean {
  if (typeof window === "undefined") return false
  // Check sessionStorage instead for runtime only
  return sessionStorage.getItem("admin_session") === "true"
}
