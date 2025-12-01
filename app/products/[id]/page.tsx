"use client"

import { useEffect, useState } from "react"
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
} from "lucide-react"

interface Product {
  id: string
  name: string
  brand: string | null
  category: string | null
  description: string | null
  image_url: string | null
  ingredients: string[] | null
  claims: string[] | null
  status: string
  created_at: string
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

  useEffect(() => {
    const checkAuthAndFetchProduct = async () => {
      try {
        // Check auth
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (!user || authError) {
          router.push('/login')
          return
        }
        setUser(user)

        // Fetch product
        const { data, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .eq('user_id', user.id)
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
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthAndFetchProduct()
  }, [router, supabase, productId])

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
            Processing
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
              <p className="text-gray-500 font-manrope">{product.brand}</p>
            )}
            {product.category && (
              <p className="text-sm text-gray-400 font-manrope">{product.category}</p>
            )}
          </div>
        </div>

        {/* Status Card for Pending */}
        {product.status === 'pending' && (
          <Card className="border-0 shadow-sm mb-6 bg-yellow-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Loader2 className="w-6 h-6 animate-spin text-yellow-600" />
                <div>
                  <h3 className="font-semibold text-gray-900 font-manrope">Identifying Product</h3>
                  <p className="text-sm text-gray-600 font-manrope">
                    We're gathering information about this product. This may take a moment.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Product Details */}
        <div className="grid gap-6">
          {product.description && (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold font-lora">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 font-manrope">{product.description}</p>
              </CardContent>
            </Card>
          )}

          {product.ingredients && product.ingredients.length > 0 && (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold font-lora">Key Ingredients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {product.ingredients.map((ingredient, index) => (
                    <Badge key={index} variant="secondary" className="font-manrope">
                      {ingredient}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {product.claims && product.claims.length > 0 && (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold font-lora">Product Claims</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {product.claims.map((claim, index) => (
                    <li key={index} className="text-gray-600 font-manrope flex items-start gap-2">
                      <span className="text-gray-400">•</span>
                      {claim}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Placeholder for future AI analysis */}
          {product.status === 'ready' && (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold font-lora">AI Visibility Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 font-manrope text-center py-8">
                  AI visibility analysis coming soon...
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Metadata */}
        <div className="mt-8 text-sm text-gray-400 font-manrope">
          Added on {new Date(product.created_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  )
}
