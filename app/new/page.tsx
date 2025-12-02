"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/app/utils/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, Sparkles, Loader2, Wifi, WifiOff } from "lucide-react"
import { useProductWebSocket } from "@/app/hooks/useProductWebSocket"

export default function NewProductPage() {
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [productName, setProductName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // WebSocket connection for real-time updates
  const { status: wsStatus, submitProduct, isConnected } = useProductWebSocket({
    userId: user?.id || null,
    onProductUpdate: useCallback((update) => {
      console.log('Product update received:', update)
      // Handle updates here if needed (e.g., show toast notifications)
    }, [])
  })

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (user && !error) {
          setUser(user)
        } else {
          router.push('/login')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!productName.trim() || isSubmitting) return

    setIsSubmitting(true)

    try {
      // Create product entry with pending status
      const { data, error } = await supabase
        .from('products')
        .insert({
          user_id: user.id,
          name: productName.trim(),
          status: 'pending'
        })
        .select()
        .single()

      if (error) throw error

      // Submit via WebSocket if connected, otherwise fall back to direct webhook
      if (isConnected) {
        submitProduct(data.id, productName.trim())
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
              product_name: productName.trim()
            })
          }).catch(err => {
            console.error('Failed to trigger product identification:', err)
          })
        }
      }

      // Redirect to the product page
      router.push(`/products/${data.id}`)
    } catch (error) {
      console.error('Failed to create product:', error)
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="h-full overflow-auto">
      <div className="min-h-full flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-bg-300 mb-4">
              <Sparkles className="w-6 h-6 text-gray-600" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 font-lora tracking-wide mb-2">
              Add a Product
            </h1>
            <p className="text-gray-500 font-manrope">
              Enter a product name and we'll identify it and gather information
            </p>
          </div>

          {/* Form */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    type="text"
                    placeholder="e.g., CeraVe Hydrating Cleanser"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="h-12 text-base font-manrope"
                    autoFocus
                    disabled={isSubmitting}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 font-manrope"
                  disabled={!productName.trim() || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Identifying Product...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Connection status indicator */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {isConnected ? (
              <>
                <Wifi className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600 font-manrope">Real-time updates active</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400 font-manrope">
                  {wsStatus === 'connecting' ? 'Connecting...' : 'Using standard updates'}
                </span>
              </>
            )}
          </div>

          {/* Help text */}
          <p className="text-center text-sm text-gray-400 mt-6 font-manrope">
            You can add any beauty or skincare product. We'll analyze how it appears in AI conversations.
          </p>
        </div>
      </div>
    </div>
  )
}
