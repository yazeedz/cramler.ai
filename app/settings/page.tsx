"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/app/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (user && !error) {
        setUser(user)
      } else {
        router.push('/login')
      }
      setIsLoading(false)
    }
    checkAuth()
  }, [router, supabase])

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
    <div className="relative mx-auto flex h-full w-full max-w-3xl flex-1 flex-col px-4 md:px-2">
      <div className="mx-auto mt-4 pt-12 md:pt-20 flex w-full flex-col items-center gap-8 max-w-2xl">
        <div className="font-linux-libertine-display tracking-wider text-text-200 w-full text-center text-3xl sm:text-4xl">
          Settings
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-900">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Name</label>
              <p className="text-gray-900">{user.user_metadata?.full_name || user.user_metadata?.name || 'Not set'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Account Created</label>
              <p className="text-gray-900">{new Date(user.created_at).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
