"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tag } from "lucide-react"

interface BrandHeaderProps {
  brand: {
    name: string
    logo_url?: string | null
    description?: string | null
  }
  productCount: number
}

export function BrandHeader({ brand, productCount }: BrandHeaderProps) {
  return (
    <div className="flex items-center gap-4 p-6 bg-card rounded-lg border">
      {brand.logo_url ? (
        <Avatar className="w-16 h-16">
          <AvatarImage src={brand.logo_url} alt={brand.name} />
          <AvatarFallback className="text-xl font-bold bg-muted">
            {brand.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
          <Tag className="w-8 h-8 text-muted-foreground" />
        </div>
      )}
      <div>
        <h1 className="text-2xl font-bold font-manrope">{brand.name}</h1>
        {brand.description && (
          <p className="text-muted-foreground font-manrope">{brand.description}</p>
        )}
        <p className="text-sm text-muted-foreground font-manrope mt-1">
          {productCount} {productCount === 1 ? "Product" : "Products"} tracked
        </p>
      </div>
    </div>
  )
}
