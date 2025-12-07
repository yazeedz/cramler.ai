"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useUserContextValue } from "@/app/providers/UserContextProvider"
import { createClient } from "@/app/utils/supabase/client"
import { useProductWebSocket } from "@/app/hooks/useProductWebSocket"
import {
  AlertCircle,
  Plus,
  Search,
  Package,
  Loader2,
  TrendingUp,
  TrendingDown,
  Minus,
  Wifi,
  WifiOff,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Product {
  id: string
  name: string
  image_url?: string | null
  product_type?: string | null
  price?: string | null
  status: "pending" | "researching" | "ready" | "error"
  created_at: string
  product_visibility_reports?: Array<{
    overall_visibility_score: number | null
    category_rank: number | null
    visibility_change: number | null
  }>
}

const statusConfig = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  researching: { label: "Researching", color: "bg-blue-100 text-blue-800 border-blue-200" },
  ready: { label: "Ready", color: "bg-green-100 text-green-800 border-green-200" },
  error: { label: "Error", color: "bg-red-100 text-red-800 border-red-200" },
}

export default function ProductsPage() {
  const router = useRouter()
  const { user, currentBrand, isLoading: contextLoading } = useUserContextValue()
  const [isLoading, setIsLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isAddingProduct, setIsAddingProduct] = useState(false)
  const [newProductName, setNewProductName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const supabase = createClient()

  // WebSocket for real-time product updates
  const handleProductUpdate = useCallback((update: any) => {
    console.log('Product update received:', update)

    if (update.type === 'PRODUCT_READY' || update.type === 'PRODUCT_ERROR') {
      // Update the product in the list
      setProducts(prev => prev.map(p => {
        if (p.id === update.productId) {
          return {
            ...p,
            status: update.type === 'PRODUCT_READY' ? 'ready' : 'error',
            ...update.data
          }
        }
        return p
      }))
    }
  }, [])

  const { status: wsStatus, submitProduct, isConnected } = useProductWebSocket({
    userId: user?.id || null,
    onProductUpdate: handleProductUpdate
  })

  useEffect(() => {
    async function fetchProducts() {
      if (!currentBrand) return

      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from("products")
          .select(`
            *,
            product_visibility_reports (
              overall_visibility_score,
              category_rank,
              visibility_change
            )
          `)
          .eq("brand_id", currentBrand.id)
          .eq("is_active", true)
          .order("created_at", { ascending: false })

        if (error) throw error
        setProducts(data || [])
      } catch (error) {
        console.error("Failed to fetch products:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [currentBrand, supabase])

  async function handleAddProduct() {
    if (!currentBrand || !newProductName.trim() || !user) return

    setIsSubmitting(true)
    try {
      // Create product with pending status
      const { data, error } = await supabase
        .from("products")
        .insert({
          name: newProductName.trim(),
          brand_id: currentBrand.id,
          user_id: user.id,
          status: "pending",
          is_active: true,
          created_by: user.id,
        })
        .select()
        .single()

      if (error) throw error

      // Add to local state
      setProducts(prev => [{ ...data, product_visibility_reports: [] }, ...prev])

      // Trigger n8n workflow via WebSocket or direct webhook
      if (isConnected) {
        submitProduct(data.id, newProductName.trim())
      } else {
        // Fallback: Trigger n8n webhook directly
        const webhookUrl = process.env.NEXT_PUBLIC_N8N_PRODUCT_IDENTIFIER_WEBHOOK
        if (webhookUrl) {
          fetch(webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              product_id: data.id,
              user_id: user.id,
              product_name: newProductName.trim()
            })
          }).catch(err => {
            console.error('Failed to trigger product identification:', err)
          })
        }
      }

      setNewProductName("")
      setIsAddingProduct(false)

      // Navigate to the product page
      router.push(`/products/${data.id}`)
    } catch (error) {
      console.error("Failed to add product:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || product.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (contextLoading) {
    return <ProductsSkeleton />
  }

  if (!currentBrand) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Brand Selected</h2>
          <p className="text-muted-foreground mb-4">
            Please select a brand from the sidebar to view products.
          </p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return <ProductsSkeleton />
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold font-manrope">Products</h1>
          {/* Connection status */}
          <div className="flex items-center gap-1.5">
            {isConnected ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
        <Dialog open={isAddingProduct} onOpenChange={setIsAddingProduct}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Adding to: <span className="font-medium">{currentBrand.name}</span>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="productName">Product Name</Label>
                <Input
                  id="productName"
                  placeholder="e.g., Sauvage Eau de Parfum"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newProductName.trim() && !isSubmitting) {
                      handleAddProduct()
                    }
                  }}
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Our AI will automatically research this product and populate details like ingredients, claims, and pricing.
              </p>
              {/* Connection status in dialog */}
              <div className="flex items-center gap-2 text-sm">
                {isConnected ? (
                  <>
                    <Wifi className="h-4 w-4 text-green-500" />
                    <span className="text-green-600">Real-time updates active</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {wsStatus === 'connecting' ? 'Connecting...' : 'Using standard updates'}
                    </span>
                  </>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingProduct(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleAddProduct} disabled={!newProductName.trim() || isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Add Product
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="researching">Researching</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Products List */}
      {filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {products.length === 0 ? "No products yet" : "No matching products"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {products.length === 0
                ? "Add your first product to start tracking its AI visibility."
                : "Try adjusting your search or filters."}
            </p>
            {products.length === 0 && (
              <Button onClick={() => setIsAddingProduct(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add your first product
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination info */}
      {filteredProducts.length > 0 && (
        <p className="text-sm text-muted-foreground text-center">
          Showing {filteredProducts.length} of {products.length} products
        </p>
      )}
    </div>
  )
}

function ProductCard({ product }: { product: Product }) {
  const report = product.product_visibility_reports?.[0]
  const status = statusConfig[product.status] || statusConfig.pending
  const change = report?.visibility_change

  return (
    <Link href={`/products/${product.id}`}>
      <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            {/* Product Image */}
            <Avatar className="h-14 w-14 rounded-lg">
              {product.image_url ? (
                <AvatarImage src={product.image_url} alt={product.name} />
              ) : null}
              <AvatarFallback className="rounded-lg bg-muted">
                <Package className="h-6 w-6 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold truncate">{product.name}</h3>
                <Badge variant="outline" className={cn("text-xs", status.color)}>
                  {status.label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {[product.product_type, product.price].filter(Boolean).join(" • ") || "No details yet"}
              </p>
            </div>

            {/* Visibility Stats */}
            {product.status === "ready" && report && (
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <p className="text-2xl font-bold">{report.overall_visibility_score ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">Score</p>
                </div>
                {report.category_rank && (
                  <div className="text-center">
                    <p className="text-lg font-semibold">#{report.category_rank}</p>
                    <p className="text-xs text-muted-foreground">Rank</p>
                  </div>
                )}
                {change !== null && change !== undefined && (
                  <div className={cn(
                    "flex items-center gap-1",
                    change > 0 ? "text-green-600" : change < 0 ? "text-red-600" : "text-muted-foreground"
                  )}>
                    {change > 0 ? <TrendingUp className="h-4 w-4" /> : change < 0 ? <TrendingDown className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                    <span className="font-medium">{change > 0 ? "+" : ""}{change}</span>
                  </div>
                )}
              </div>
            )}

            {(product.status === "researching" || product.status === "pending") && (
              <div className="flex items-center gap-2 text-blue-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">
                  {product.status === "pending" ? "Queued..." : "Researching..."}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function ProductsSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="flex gap-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    </div>
  )
}
