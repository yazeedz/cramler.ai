"use client"

import React from "react"
import { usePathname } from "next/navigation"
import TheSidebar from "@/components/sidebar/thesidebar"
import { UserContextProvider } from "@/app/providers/UserContextProvider"
import { OnboardingGuard } from "@/app/components/OnboardingGuard"

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Routes that should NOT have the sidebar (auth routes)
  const authRoutes = ['/login', '/legal/terms', '/legal/privacy', '/legal/usage', '/auth', '/logout']

  // Routes that need user context but no sidebar
  const noSidebarRoutes = ['/onboarding']

  // Check if current route is an auth route
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  // Check if current route needs no sidebar
  const isNoSidebarRoute = noSidebarRoutes.some(route => pathname.startsWith(route))

  // For auth routes, render children directly without sidebar or context
  if (isAuthRoute) {
    return <>{children}</>
  }

  // For onboarding, render with user context but no sidebar
  if (isNoSidebarRoute) {
    return (
      <UserContextProvider>
        {children}
      </UserContextProvider>
    )
  }

  // For authenticated routes, render with sidebar, user context, and onboarding guard
  return (
    <UserContextProvider>
      <OnboardingGuard>
        <TheSidebar>
          {children}
        </TheSidebar>
      </OnboardingGuard>
    </UserContextProvider>
  )
}
