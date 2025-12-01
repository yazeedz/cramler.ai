'use client'

import React, { useState, useEffect, ReactNode } from 'react'
import { usePathname } from 'next/navigation'

interface RouteGuardProps {
  children: ReactNode
}

export default function RouteGuard({ children }: RouteGuardProps) {
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    // Quick check for existing session cookies to minimize loading time
    const hasSessionCookie = document.cookie.includes('sb-')
    
    if (hasSessionCookie) {
      // If we have session cookies, show content immediately
      // Middleware will handle any necessary redirects
      setIsInitialLoad(false)
    } else {
      // Brief delay to allow middleware redirects to process
      const timer = setTimeout(() => {
        setIsInitialLoad(false)
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [pathname])

  // Show loading screen during initial load
  if (isInitialLoad) {
    return (
      <div className="fixed inset-0 bg-bg-100 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin h-16 w-16 border-4 border-gray-200 rounded-full border-t-blue-600 mx-auto mb-4"></div>
          </div>
        </div>
      </div>
    )
  }

  // Render children - middleware handles all routing logic
  return <>{children}</>
} 