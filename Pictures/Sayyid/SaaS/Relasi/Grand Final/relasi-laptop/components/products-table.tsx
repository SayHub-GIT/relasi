"use client"

import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { createSupabaseClient } from "@/lib/supabase-client"

interface Laptop {
  id: string
  name: string
  price: number
  condition: string
  is_sold_out: boolean
  year: number
}

interface ProductsTableProps {
  products: Laptop[]
  onEdit: (product: Laptop) => void
  onDelete: (id: string) => void
  onMarkAsSold?: (product: Laptop) => void
}

export default function ProductsTable({ products, onEdit, onDelete, onMarkAsSold }: ProductsTableProps) {
  const supabase = createSupabaseClient()

  const handleMarkAsSold = async (product: Laptop) => {
    if (product.is_sold_out) {
      alert("Laptop is already marked as sold")
      return
    }

    if (window.confirm(`Mark ${product.name} as sold?`)) {
      try {
        // Update laptop status
        const { error: updateError } = await supabase.from("laptops").update({ is_sold_out: true }).eq("id", product.id)

        if (updateError) throw updateError

        // Log to sales_log
        await supabase.from("sales_log").insert([
          {
            laptop_id: product.id,
            laptop_name: product.name,
            price: product.price,
            activity_type: "SOLD",
          },
        ])

        if (onMarkAsSold) {
          onMarkAsSold(product)
        }

        alert("Laptop successfully marked as sold!")
      } catch (err) {
        console.error("Error marking as sold:", err)
        alert("Failed to mark laptop as sold")
      }
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-muted">
            <th className="text-left p-3 font-semibold">Name</th>
            <th className="text-left p-3 font-semibold">Year</th>
            <th className="text-left p-3 font-semibold">Condition</th>
            <th className="text-left p-3 font-semibold">Price</th>
            <th className="text-left p-3 font-semibold">Status</th>
            <th className="text-left p-3 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b border-border hover:bg-muted/50">
              <td className="p-3 font-medium">{product.name}</td>
              <td className="p-3">{product.year}</td>
              <td className="p-3">
                <Badge variant={product.condition === "new" ? "default" : "secondary"}>
                  {product.condition === "new" ? "New" : "Second"}
                </Badge>
              </td>
              <td className="p-3 font-semibold">Rp {Number.parseInt(String(product.price)).toLocaleString("id-ID")}</td>
              <td className="p-3">
                <Badge variant={product.is_sold_out ? "destructive" : "outline"}>
                  {product.is_sold_out ? "Sold Out" : "Available"}
                </Badge>
              </td>
              <td className="p-3 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => onEdit(product)} className="gap-1">
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => onDelete(product.id)} className="gap-1">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
