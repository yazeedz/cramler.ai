"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/app/utils/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, Sparkles, Loader2 } from "lucide-react"

export default function NewProductPage() {
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [productName, setProductName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      // For now, just create a basic product entry
      // Later we'll add the AI identification agent
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

      // Redirect to the product page
      router.push(`/products/${data.id}`)
    } catch (error) {
      console.error('Failed to create product:', error)
      // For now, just log the error
      // TODO: Show error toast
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

          {/* Help text */}
          <p className="text-center text-sm text-gray-400 mt-6 font-manrope">
            You can add any beauty or skincare product. We'll analyze how it appears in AI conversations.
          </p>
        </div>
      </div>
    </div>
  )
}
