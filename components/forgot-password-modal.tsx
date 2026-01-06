"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle, CheckCircle, Mail } from "lucide-react"

interface ForgotPasswordModalProps {
  open: boolean
  onClose: () => void
  onResetSuccess: () => void
}

export default function ForgotPasswordModal({ open, onClose, onResetSuccess }: ForgotPasswordModalProps) {
  const [step, setStep] = useState<"email" | "verify" | "reset">("email")
  const [email, setEmail] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (!email) {
      setMessage({ type: "error", text: "Email harus diisi" })
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setMessage({ type: "error", text: "Format email tidak valid" })
      return
    }

    if (email !== "admin@relasi.com") {
      setMessage({ type: "error", text: "Email admin tidak ditemukan" })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/admin/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage({ type: "error", text: data.message || "Gagal mengirim email reset" })
      } else {
        setMessage({ type: "success", text: "Kode verifikasi telah dikirim ke email Anda" })
        setTimeout(() => {
          setMessage(null)
          setStep("verify")
        }, 2000)
      }
    } catch (error) {
      setMessage({ type: "error", text: "Terjadi kesalahan saat mengirim email" })
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (!verificationCode) {
      setMessage({ type: "error", text: "Kode verifikasi harus diisi" })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/admin/verify-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: verificationCode }),
      })

      if (!response.ok) {
        setMessage({ type: "error", text: "Kode verifikasi salah atau sudah expired" })
      } else {
        setMessage({ type: "success", text: "Kode berhasil diverifikasi!" })
        setTimeout(() => {
          setMessage(null)
          setStep("reset")
        }, 2000)
      }
    } catch (error) {
      setMessage({ type: "error", text: "Terjadi kesalahan saat verifikasi" })
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (!newPassword || !confirmPassword) {
      setMessage({ type: "error", text: "Password harus diisi" })
      return
    }

    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "Password minimal 6 karakter" })
      return
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Password tidak cocok" })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: verificationCode, newPassword }),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage({ type: "error", text: data.message || "Gagal mereset password" })
      } else {
        setMessage({ type: "success", text: "Password berhasil direset! Login dengan password baru Anda" })
        setTimeout(() => {
          setMessage(null)
          setEmail("")
          setVerificationCode("")
          setNewPassword("")
          setConfirmPassword("")
          setStep("email")
          onResetSuccess()
          onClose()
        }, 2000)
      }
    } catch (error) {
      setMessage({ type: "error", text: "Terjadi kesalahan saat mereset password" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Lupa Password</DialogTitle>
          <DialogDescription>
            {step === "email" && "Masukkan email admin untuk menerima kode reset"}
            {step === "verify" && "Masukkan kode verifikasi dari email Anda"}
            {step === "reset" && "Buat password baru untuk akun admin Anda"}
          </DialogDescription>
        </DialogHeader>

        {step === "email" && (
          <form onSubmit={handleRequestReset} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Admin</label>
              <Input
                type="email"
                placeholder="admin@relasi.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            {message && (
              <div
                className={`flex items-center gap-2 p-3 rounded-lg ${message.type === "success" ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}`}
              >
                {message.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span className="text-sm">{message.text}</span>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="flex-1 bg-transparent"
              >
                Batal
              </Button>
              <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90" disabled={loading}>
                {loading ? "Mengirim..." : "Kirim Kode"}
              </Button>
            </div>
          </form>
        )}

        {step === "verify" && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Kode Verifikasi</label>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-3 flex items-center gap-2 text-sm text-blue-600">
                <Mail className="w-4 h-4" />
                Kode telah dikirim ke {email}
              </div>
              <Input
                type="text"
                placeholder="Masukkan 6 digit kode"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                maxLength={6}
                disabled={loading}
              />
            </div>

            {message && (
              <div
                className={`flex items-center gap-2 p-3 rounded-lg ${message.type === "success" ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}`}
              >
                {message.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span className="text-sm">{message.text}</span>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("email")}
                disabled={loading}
                className="flex-1"
              >
                Kembali
              </Button>
              <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90" disabled={loading}>
                {loading ? "Verifikasi..." : "Verifikasi"}
              </Button>
            </div>
          </form>
        )}

        {step === "reset" && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Password Baru</label>
              <Input
                type="password"
                placeholder="Masukkan password baru (min. 6 karakter)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Konfirmasi Password</label>
              <Input
                type="password"
                placeholder="Konfirmasi password baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            {message && (
              <div
                className={`flex items-center gap-2 p-3 rounded-lg ${message.type === "success" ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}`}
              >
                {message.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span className="text-sm">{message.text}</span>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("email")}
                disabled={loading}
                className="flex-1"
              >
                Batal
              </Button>
              <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90" disabled={loading}>
                {loading ? "Mengubah..." : "Reset Password"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
