"use client"

import React, { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/app/utils/supabase/client"
import { getAuthRedirectUrl } from "@/lib/utils/site-config"

// Client component to handle search params
function LoginWithSearchParams({ onMessage, onError }: { onMessage: (message: string) => void, onError: (error: string) => void }) {
  const searchParams = useSearchParams()

  useEffect(() => {
    const messageParam = searchParams.get('message')
    if (messageParam) {
      onMessage(messageParam)
    }

    // Handle error and error_description from URL
    const errorParam = searchParams.get('error')
    if (errorParam) {
      const errorDesc = searchParams.get('error_description') || ''

      // Create user-friendly error messages based on error type
      if (errorParam === 'rate_limit') {
        onError('You have attempted to log in too many times. Please wait a few minutes and try again.')
      } else if (errorParam === 'session_exchange') {
        onError(`Login failed: ${errorDesc}. Please try again or use a different login method.`)
      } else {
        onError(`Authentication error: ${errorDesc}`)
      }
    }
  }, [searchParams, onMessage, onError])

  return null
}

export default function LoginPage() {
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  const router = useRouter()

  // Create Supabase client
  const supabase = createClient()

  // Check if user is already authenticated and redirect to /new
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (user && !error) {
          console.log('User already authenticated, redirecting to /new')
          router.replace('/new')
          return
        }
      } catch (error) {
        console.log('Auth check error:', error)
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [router, supabase.auth])

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    setError("")

    try {
      const redirectUrl = getAuthRedirectUrl('/auth/callback')

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })

      if (error) {
        throw error
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error("No OAuth URL returned from Supabase")
      }
    } catch (error: any) {
      setError(error.message || "Failed to sign in with Google")
      setIsGoogleLoading(false)
    }
  }

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="fixed inset-0 bg-bg-100 overflow-y-auto overflow-x-hidden">
        <div className="min-h-full w-full font-manrope flex items-center justify-center">
          <div className="animate-pulse text-gray-500">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-bg-100 overflow-y-auto overflow-x-hidden">
      <div className="min-h-full w-full font-manrope">
        <main className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="flex flex-col w-full max-w-md mx-auto">

            {/* Logo */}
            <div className="text-center mb-8">
              <span className="text-[2.5rem] font-semibold text-gray-900 whitespace-nowrap tracking-wide font-lora">Cramler AI</span>
            </div>

            {/* Tagline */}
            <div className="text-center mb-8">
              <h2 className="text-text-200 text-xl font-normal">
                
              </h2>
            </div>

            <Suspense fallback={null}>
              <LoginWithSearchParams
                onMessage={setMessage}
                onError={setError}
              />
            </Suspense>

            <Card className="w-full shadow-sm bg-white border border-gray-200">
              <CardContent className="space-y-6 p-8">
                {message && (
                  <Alert className="mb-4">
                    <AlertDescription>{message}</AlertDescription>
                  </Alert>
                )}

                {error && (
                  <Alert className="mb-4 bg-red-50 text-red-800 border-red-200">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Google Sign In Button */}
                <Button
                  variant="outline"
                  className="w-full h-12 text-base font-medium bg-white border-gray-300 hover:bg-gray-50"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading}
                >
                  <svg className="w-5 h-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M15.545 6.558a9.4 9.4 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.7 7.7 0 0 1 5.352 2.082l-2.284 2.284A4.35 4.35 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.8 4.8 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.7 3.7 0 0 0 1.599-2.431H8v-3.08z"/>
                  </svg>
                  {isGoogleLoading ? 'Signing in...' : 'Continue with Google'}
                </Button>

                {/* Terms and Privacy */}
                <div className="text-center text-sm text-gray-500 space-y-1">
                  <p>
                    By continuing, you agree to our{" "}
                    <a href="/legal/terms" className="text-gray-700 underline hover:text-gray-900">
                      Terms
                    </a>{" "}
                    and{" "}
                    <a href="/legal/privacy" className="text-gray-700 underline hover:text-gray-900">
                      Privacy Policy
                    </a>
                    .
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Copyright */}
            <div className="text-center mt-8">
              <p className="text-xs text-gray-400">
                © 2025 Cramler Inc. All rights reserved.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
