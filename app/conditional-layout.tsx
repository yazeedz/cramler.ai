"use client"

import React from "react"
import { usePathname } from "next/navigation"
import TheSidebar from "@/components/sidebar/thesidebar"

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Routes that should NOT have the sidebar (auth routes)
  const authRoutes = ['/login', '/legal/terms', '/legal/privacy', '/legal/usage', '/auth', '/logout']

  // Check if current route is an auth route
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  // For auth routes, render children directly without sidebar
  if (isAuthRoute) {
    return <>{children}</>
  }

  // For authenticated routes, render with sidebar
  return (
    <TheSidebar>
      {children}
    </TheSidebar>
  )
}
