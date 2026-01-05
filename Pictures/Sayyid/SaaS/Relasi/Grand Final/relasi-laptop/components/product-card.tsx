"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ProductCardProps {
  product: {
    id: string
    name: string
    description: string
    price: number
    condition: string
    is_sold_out: boolean
    image_url?: string
  }
  onClick: () => void
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const isSoldOut = product.is_sold_out

  return (
    <Card
      onClick={onClick}
      className="overflow-hidden hover:shadow-xl transition-shadow duration-300 group cursor-pointer leading-10 tracking-normal mx-0 my-0 px-0 py-0 border-0"
    >
      <div className="relative aspect-video bg-muted flex items-center justify-center overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url || "/placeholder.svg"}
            alt={product.name}
            className="w-full object-cover group-hover:scale-105 transition-transform duration-300 mx-0 my-0 px-0 py-0 h-full tracking-[] leading-[]"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
            <p className="text-muted-foreground text-sm">No image</p>
          </div>
        )}
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="destructive" className="text-lg px-4 py-2">
              SOLD OUT
            </Badge>
          </div>
        )}
        <Badge className="absolute top-3 right-3 bg-primary/90">{product.condition === "new" ? "New" : "Second"}</Badge>
      </div>

      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-lg line-clamp-2 text-foreground group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <p className="text-2xl font-bold text-primary">
            Rp {Number.parseInt(String(product.price)).toLocaleString("id-ID")}
          </p>
          {isSoldOut && (
            <Badge variant="destructive" className="text-xs">
              Sold Out
            </Badge>
          )}
        </div>
      </div>
    </Card>
  )
}
