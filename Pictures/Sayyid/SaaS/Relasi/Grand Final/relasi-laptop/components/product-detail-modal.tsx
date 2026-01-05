"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { isAdminLoggedIn } from "@/lib/admin-auth"

interface ProductDetailModalProps {
  product: any
  open: boolean
  onClose: () => void
  onEdit?: (product: any) => void
}

export default function ProductDetailModal({ product, open, onClose, onEdit }: ProductDetailModalProps) {
  const isAdmin = isAdminLoggedIn()
  const isSoldOut = product?.is_sold_out

  if (!product) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{product.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {product.image_url && (
              <div className="col-span-2">
                <img
                  src={product.image_url || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full aspect-video object-contain rounded-lg bg-muted"
                />
              </div>
            )}

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Condition</p>
              <Badge variant={product.condition === "new" ? "default" : "secondary"}>
                {product.condition === "new" ? "New" : "Second Hand"}
              </Badge>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Year</p>
              <p className="font-semibold">{product.year}</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Price</p>
              <p className="text-2xl font-bold text-primary">
                Rp {Number.parseInt(product.price).toLocaleString("id-ID")}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={isSoldOut ? "destructive" : "secondary"}>{isSoldOut ? "Sold Out" : "Available"}</Badge>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Description</p>
            <p className="text-foreground">{product.description}</p>
          </div>

          {product.specs && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Specifications</p>
              <div className="bg-card p-4 rounded-lg space-y-2">
                {Object.entries(product.specs).map(([key, value]: any) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-muted-foreground capitalize">{key.replace(/_/g, " ")}:</span>
                    <span className="font-medium text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {isAdmin && (
              <Button onClick={() => onEdit?.(product)} className="bg-primary hover:bg-primary/90">
                Edit Product
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
