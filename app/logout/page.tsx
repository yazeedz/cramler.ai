"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/app/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function LogoutPage() {
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const handleLogout = async () => {
      try {
        console.log('Starting logout process...')

        // Set a timeout for the logout process
        const logoutTimeout = setTimeout(() => {
          console.log('Logout timeout - forcing redirect')
          localStorage.removeItem('loginAttempts')
          window.location.href = '/login'
        }, 3000)

        // Try to sign out the user
        const { error } = await supabase.auth.signOut()

        // Clear the timeout since logout completed
        clearTimeout(logoutTimeout)

        if (error) {
          console.error('Supabase logout error:', error)
        }

        console.log('Logout completed, clearing local data...')

        // Clear any local storage
        localStorage.removeItem('loginAttempts')

        console.log('Redirecting to login page...')

        // Force redirect
        window.location.href = '/login'

      } catch (error: any) {
        console.error('Logout error:', error)
        localStorage.removeItem('loginAttempts')
        window.location.href = '/login'
      }
    }

    handleLogout()
  }, [supabase.auth])

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Logout Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => router.push('/login')}
              className="text-blue-600 hover:underline"
            >
              Go to Login
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-bg-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Logging Out</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Please wait...</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
