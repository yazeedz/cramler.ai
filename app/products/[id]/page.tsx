"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@/app/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Package,
  Loader2,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  Tag,
  Users,
  DollarSign,
  Beaker,
  Target,
  RefreshCw,
  Wifi,
  WifiOff,
} from "lucide-react"
import { useProductWebSocket } from "@/app/hooks/useProductWebSocket"

interface Product {
  id: string
  name: string
  brand: string | null
  description: string | null
  image_url: string | null
  ingredients: string[] | null
  claims: string[] | null
  status: string
  created_at: string
  // New fields
  product_type: string | null
  price: string | null
  what_it_does: string | null
  main_category: string | null
  sub_category: string | null
  main_difference: string | null
  target_audience: string | null
}

export default function ProductDetailPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  const supabase = createClient()

  const [user, setUser] = useState<any>(null)
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // WebSocket for real-time updates
  const { status: wsStatus, isConnected } = useProductWebSocket({
    userId: user?.id || null,
    onProductUpdate: useCallback((update) => {
      // If we receive an update for this product, refresh the data
      if (update.productId === productId) {
        console.log('Received WebSocket update for this product:', update)
        if (user?.id) {
          fetchProduct(user.id)
        }
      }
    }, [productId, user?.id])
  })

  const fetchProduct = async (userId: string) => {
    try {
      const { data, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .eq('user_id', userId)
        .single()

      if (productError) {
        if (productError.code === 'PGRST116') {
          setError('Product not found')
        } else {
          throw productError
        }
      } else {
        setProduct(data)
      }
    } catch (err) {
      console.error('Failed to fetch product:', err)
      setError('Failed to load product')
    }
  }

  useEffect(() => {
    const checkAuthAndFetchProduct = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (!user || authError) {
          router.push('/login')
          return
        }
        setUser(user)
        await fetchProduct(user.id)
      } catch (err) {
        console.error('Failed to fetch product:', err)
        setError('Failed to load product')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthAndFetchProduct()
  }, [router, supabase, productId])

  // Fallback polling if WebSocket is not connected
  useEffect(() => {
    if (!product || product.status !== 'pending' || !user) return

    // Only poll if WebSocket is not connected
    if (isConnected) {
      console.log('WebSocket connected, skipping polling')
      return
    }

    console.log('WebSocket not connected, using polling fallback')
    const interval = setInterval(() => {
      fetchProduct(user.id)
    }, 3000) // Poll every 3 seconds

    return () => clearInterval(interval)
  }, [product?.status, user, isConnected])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="h-full overflow-auto">
        <div className="p-6 max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => router.push('/new')}
            className="mb-6 font-manrope"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-gray-900 mb-2 font-lora">
                {error || 'Product not found'}
              </h2>
              <p className="text-gray-500 font-manrope">
                This product may have been deleted or you don't have access to it.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-yellow-200">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Identifying...
          </Badge>
        )
      case 'ready':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
            <Sparkles className="w-3 h-3 mr-1" />
            Ready
          </Badge>
        )
      case 'error':
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-700 border-red-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            Error
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary">
            {status}
          </Badge>
        )
    }
  }

  return (
    <div className="h-full overflow-auto">
      <div className="p-6 max-w-4xl mx-auto">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/new')}
          className="mb-6 font-manrope"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Product Header */}
        <div className="flex items-start gap-6 mb-8">
          <div className="w-20 h-20 rounded-xl bg-bg-300 flex items-center justify-center flex-shrink-0">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <Package className="w-8 h-8 text-gray-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-semibold text-gray-900 font-lora tracking-wide truncate">
                {product.name}
              </h1>
              {getStatusBadge(product.status)}
            </div>
            {product.brand && (
              <p className="text-gray-600 font-manrope font-medium">{product.brand}</p>
            )}
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {product.main_category && (
                <Badge variant="outline" className="font-manrope text-xs">
                  {product.main_category}
                </Badge>
              )}
              {product.sub_category && (
                <Badge variant="outline" className="font-manrope text-xs">
                  {product.sub_category}
                </Badge>
              )}
              {product.product_type && (
                <Badge variant="outline" className="font-manrope text-xs bg-bg-200">
                  {product.product_type}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Status Card for Pending */}
        {product.status === 'pending' && (
          <Card className="border-0 shadow-sm mb-6 bg-yellow-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <RefreshCw className="w-6 h-6 animate-spin text-yellow-600" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 font-manrope">Identifying Product</h3>
                  <p className="text-sm text-gray-600 font-manrope">
                    Our AI agent is gathering information about this product. This usually takes 10-30 seconds.
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {isConnected ? (
                    <>
                      <Wifi className="w-4 h-4 text-green-500" />
                      <span className="text-xs text-green-600">Live</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-400">Polling</span>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Product Details Grid */}
        {product.status === 'ready' && (
          <div className="grid gap-6">
            {/* Quick Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {product.price && (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-bg-300 rounded-lg">
                        <DollarSign className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-manrope">Price</p>
                        <p className="font-semibold text-gray-900 font-manrope">{product.price}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              {product.target_audience && (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-bg-300 rounded-lg">
                        <Users className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-manrope">Target Audience</p>
                        <p className="font-semibold text-gray-900 font-manrope text-sm">{product.target_audience}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              {product.product_type && (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-bg-300 rounded-lg">
                        <Tag className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-manrope">Product Type</p>
                        <p className="font-semibold text-gray-900 font-manrope capitalize">{product.product_type}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold font-lora">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 font-manrope">{product.description}</p>
                </CardContent>
              </Card>
            )}

            {/* What It Does */}
            {product.what_it_does && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold font-lora">What It Does</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 font-manrope">{product.what_it_does}</p>
                </CardContent>
              </Card>
            )}

            {/* Main Difference / USP */}
            {product.main_difference && (
              <Card className="border-0 shadow-sm bg-bg-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold font-lora flex items-center gap-2">
                    <Target className="w-5 h-5 text-gray-600" />
                    Key Differentiator
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 font-manrope">{product.main_difference}</p>
                </CardContent>
              </Card>
            )}

            {/* Key Ingredients */}
            {product.ingredients && product.ingredients.length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold font-lora flex items-center gap-2">
                    <Beaker className="w-5 h-5 text-gray-600" />
                    Key Ingredients
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {product.ingredients.map((ingredient, index) => (
                      <Badge key={index} variant="secondary" className="font-manrope bg-bg-200">
                        {ingredient}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Product Claims */}
            {product.claims && product.claims.length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold font-lora">Product Claims</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {product.claims.map((claim, index) => (
                      <li key={index} className="text-gray-600 font-manrope flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        {claim}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* AI Visibility Analysis Placeholder */}
            <Card className="border-0 shadow-sm border-dashed border-2 border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold font-lora text-gray-400">AI Visibility Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 font-manrope text-center py-8">
                  Coming soon - We'll analyze how this product appears in AI conversations
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Error State */}
        {product.status === 'error' && (
          <Card className="border-0 shadow-sm bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <div>
                  <h3 className="font-semibold text-gray-900 font-manrope">Identification Failed</h3>
                  <p className="text-sm text-gray-600 font-manrope">
                    We couldn't identify this product. Please try again or enter more details.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Metadata */}
        <div className="mt-8 text-sm text-gray-400 font-manrope">
          Added on {new Date(product.created_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  )
}
