"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useUserContextValue } from "@/app/providers/UserContextProvider"
import { Loader2 } from "lucide-react"

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isLoading, organizations, currentBrand } = useUserContextValue()

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) return

    // Don't redirect if not logged in (auth will handle this)
    if (!user) return

    // Don't redirect if already on onboarding page
    if (pathname === '/onboarding') return

    // Redirect to onboarding if no organizations or no brand
    if (organizations.length === 0 || !currentBrand) {
      router.push('/onboarding')
    }
  }, [isLoading, user, organizations, currentBrand, pathname, router])

  // Show loading while checking
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // If user needs onboarding and not on onboarding page, show loading (redirect in progress)
  if (user && (organizations.length === 0 || !currentBrand) && pathname !== '/onboarding') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return <>{children}</>
}
