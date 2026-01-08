"use client"

// These are NOT exposed to the browser/public since they don't have NEXT_PUBLIC_ prefix
const ADMIN_CREDENTIALS = {
  email: process.env.ADMIN_EMAIL || "admin@relasi.com",
  password: process.env.ADMIN_PASSWORD || "relasi123",
}

export function verifyAdminCredentials(email: string, password: string): boolean {
  return email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password
}

export function setAdminSessionClient(): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("admin_session", "true")
    localStorage.setItem("admin_session_time", new Date().toISOString())
  }
}

export function clearAdminSessionClient(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("admin_session")
    localStorage.removeItem("admin_session_time")
  }
}

export const setAdminSession = setAdminSessionClient
export const clearAdminSession = clearAdminSessionClient

export function isAdminLoggedIn(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem("admin_session") === "true"
}

export function validatePassword(password: string): boolean {
  // Password must be at least 6 characters
  return password.length >= 6
}

export function isSessionValid(): boolean {
  if (typeof window === "undefined") return false
  const sessionTime = localStorage.getItem("admin_session_time")
  if (!sessionTime) return false

  // Session valid for 7 days
  const sessionDate = new Date(sessionTime)
  const now = new Date()
  const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000

  return now.getTime() - sessionDate.getTime() < sevenDaysInMs
}
