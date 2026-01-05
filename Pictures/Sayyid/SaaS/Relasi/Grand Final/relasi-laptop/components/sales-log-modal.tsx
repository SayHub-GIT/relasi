"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createSupabaseClient } from "@/lib/supabase-client"
import { Calendar } from "lucide-react"

interface SalesLogModalProps {
  open: boolean
  onClose: () => void
}

export default function SalesLogModal({ open, onClose }: SalesLogModalProps) {
  const [logs, setLogs] = useState<any[]>([])
  const [filterMonth, setFilterMonth] = useState("")
  const [filterYear, setFilterYear] = useState("")
  const [filterActivity, setFilterActivity] = useState("all")
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseClient()

  useEffect(() => {
    if (open) {
      loadLogs()
    }
  }, [open])

  const loadLogs = async () => {
    setLoading(true)
    const { data } = await supabase.from("sales_log").select("*").order("created_at", { ascending: false })
    setLogs(data || [])
    setLoading(false)
  }

  const filteredLogs = logs.filter((log) => {
    if (filterActivity !== "all" && log.activity_type !== filterActivity) return false

    const logDate = new Date(log.created_at)
    if (filterMonth && (logDate.getMonth() + 1).toString() !== filterMonth) return false
    if (filterYear && logDate.getFullYear().toString() !== filterYear) return false

    return true
  })

  const soldCount = filteredLogs.filter((log) => log.activity_type === "SOLD").length

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 31 }, (_, i) => currentYear + i)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Sales Log & Monthly Recap</DialogTitle>
          <DialogDescription>Laptop activity history - additions and sales</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Units Sold</h3>
              </div>
              <p className="text-2xl font-bold">{soldCount}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Total Activities</h3>
              </div>
              <p className="text-2xl font-bold">{filteredLogs.length}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            <select
              value={filterActivity}
              onChange={(e) => setFilterActivity(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background text-sm"
            >
              <option value="all">All Activities</option>
              <option value="ADD">Added</option>
              <option value="SOLD">Sold</option>
            </select>

            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background text-sm"
            >
              <option value="">All Months</option>
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2024, i).toLocaleString("en-US", { month: "long" })}
                </option>
              ))}
            </select>

            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background text-sm"
            >
              <option value="">All Years</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setFilterActivity("all")
                setFilterMonth("")
                setFilterYear("")
              }}
            >
              Reset Filter
            </Button>
          </div>

          {/* Log Table */}
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Laptop</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Price</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Activity</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                      Loading...
                    </td>
                  </tr>
                ) : filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="border-t border-border hover:bg-muted/50">
                      <td className="px-4 py-3 text-sm">
                        {new Date(log.created_at).toLocaleString("en-US", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">{log.laptop_name}</td>
                      <td className="px-4 py-3 text-sm">{formatPrice(log.price)}</td>
                      <td className="px-4 py-3 text-sm">
                        <Badge variant={log.activity_type === "SOLD" ? "default" : "secondary"}>
                          {log.activity_type === "SOLD" ? "Sold" : "Added"}
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                      No activity yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
