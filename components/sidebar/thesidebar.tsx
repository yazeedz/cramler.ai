"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  PanelLeft,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  PlusCircle,
  Package,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import ProfileMenu from "@/components/sidebar/profile-menu"
import { createClient } from "@/app/utils/supabase/client"

// Navigation items (static)
const navigationItems = [
  { title: "New Product", url: "/new", icon: PlusCircle },
]

// Product type
interface Product {
  id: string
  name: string
  status: string
}

function AppSidebar({ isCollapsed, setIsCollapsed }: { isCollapsed: boolean; setIsCollapsed: (collapsed: boolean) => void }) {
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setIsLoading(false)
    }
    getUser()
  }, [supabase.auth])

  // Fetch user's products
  useEffect(() => {
    const fetchProducts = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, status')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        setProducts(data || [])
      } catch (error) {
        console.error('Failed to fetch products:', error)
      } finally {
        setProductsLoading(false)
      }
    }

    if (user) {
      fetchProducts()
    }
  }, [user, supabase])

  // Extract user info
  const email = user?.email || ""
  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || email.split('@')[0] || "User"
  const userInitials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  // Auto-collapse on mobile when navigation item is clicked
  const handleNavigationClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsCollapsed(true)
    }
  }

  return (
    <div className={cn(
      "flex h-screen flex-col bg-bg-200 border-r border-gray-200 transition-all duration-200 ease-in-out overflow-x-hidden",
      "shadow-[inset_-4px_0_6px_-4px_rgba(0,0,0,0.04)]",
      // Desktop behavior
      "md:relative md:translate-x-0",
      isCollapsed ? "md:w-12" : "md:w-72",
      // Mobile behavior
      "fixed inset-y-0 left-0 z-[100] w-72",
      isCollapsed ? "-translate-x-full" : "translate-x-0"
    )}>
      {/* Header with Logo */}
      <div className="flex h-14 items-center border-gray-200 px-2">
        <div className="flex items-center overflow-hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 p-0 text-text-400 hover:text-text-500 group relative flex-shrink-0"
          >
            <PanelLeft className="h-4 w-4 shrink-0 opacity-100 scale-100 group-hover:opacity-0 group-hover:scale-80 transition-all absolute" />
            {isCollapsed ? (
              <PanelLeftOpen className="h-4 w-4 shrink-0 opacity-0 scale-80 group-hover:opacity-100 group-hover:scale-100 transition-all absolute" />
            ) : (
              <PanelLeftClose className="h-4 w-4 shrink-0 opacity-0 scale-80 group-hover:opacity-100 group-hover:scale-100 transition-all absolute" />
            )}
          </Button>
          <div className={cn(
            "transition-all duration-200 ease-in-out overflow-hidden ml-0",
            isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
          )}>
            <Link href="/new">
              <span className="text-lg font-semibold text-gray-900 whitespace-nowrap tracking-wide font-lora">Cramler</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-1">
        {/* Navigation Items */}
        <nav className="space-y-1 px-2 mb-4">
          {navigationItems.map((item) => {
            const isActive = pathname === item.url
            return (
              <Link
                key={item.title}
                href={item.url}
                onClick={handleNavigationClick}
                className={cn(
                  "flex items-center rounded-lg py-2 text-sm font-medium transition-all duration-200 relative overflow-hidden",
                  isActive
                    ? "bg-bg-400 text-gray-900"
                    : "text-gray-700 hover:bg-bg-400 hover:text-gray-900"
                )}
                title={isCollapsed ? item.title : undefined}
              >
                <div className="flex h-5 w-8 items-center justify-center flex-shrink-0">
                  <item.icon className={cn("h-4 w-4", isActive && "text-gray-600")} />
                </div>
                <div className={cn(
                  "transition-all duration-200 ease-in-out ml-0 overflow-hidden",
                  isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
                )}>
                  <span className="truncate whitespace-nowrap tracking-wide font-manrope">{item.title}</span>
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Products Section */}
        <div className="mb-4">
          <div className={cn(
            "px-3 mb-2 transition-all duration-200",
            isCollapsed ? "opacity-0 h-0 overflow-hidden" : "opacity-100"
          )}>
            <span className="text-xs font-medium text-text-400 uppercase tracking-wider font-manrope">
              Products
            </span>
          </div>

          <nav className="space-y-1 px-2">
            {productsLoading ? (
              <div className={cn(
                "flex items-center py-2 text-sm text-gray-400",
                isCollapsed && "justify-center"
              )}>
                <div className="flex h-5 w-8 items-center justify-center flex-shrink-0">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
                <span className={cn(
                  "transition-all duration-200 ease-in-out ml-0 overflow-hidden font-manrope",
                  isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
                )}>
                  Loading...
                </span>
              </div>
            ) : products.length === 0 ? (
              <div className={cn(
                "flex items-center py-2 text-sm text-gray-400",
                isCollapsed && "justify-center"
              )}>
                <div className="flex h-5 w-8 items-center justify-center flex-shrink-0">
                  <Package className="h-4 w-4" />
                </div>
                <span className={cn(
                  "transition-all duration-200 ease-in-out ml-0 overflow-hidden font-manrope",
                  isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
                )}>
                  No products yet
                </span>
              </div>
            ) : (
              products.map((product) => {
                const isActive = pathname === `/products/${product.id}`
                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    onClick={handleNavigationClick}
                    className={cn(
                      "flex items-center rounded-lg py-2 text-sm font-medium transition-all duration-200 relative overflow-hidden",
                      isActive
                        ? "bg-bg-400 text-gray-900"
                        : "text-gray-700 hover:bg-bg-400 hover:text-gray-900"
                    )}
                    title={isCollapsed ? product.name : undefined}
                  >
                    <div className="flex h-5 w-8 items-center justify-center flex-shrink-0">
                      <Package className={cn("h-4 w-4", isActive && "text-gray-600")} />
                    </div>
                    <div className={cn(
                      "transition-all duration-200 ease-in-out ml-0 overflow-hidden flex-1 min-w-0",
                      isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
                    )}>
                      <span className="truncate whitespace-nowrap tracking-wide font-manrope block">{product.name}</span>
                    </div>
                  </Link>
                )
              })
            )}
          </nav>
        </div>
      </div>

      {/* User Profile */}
      <div className="border-gray-200 pb-3 px-2">
        <ProfileMenu
          displayName={displayName}
          userInitials={userInitials}
          email={email}
          isCollapsed={isCollapsed}
        >
          <div className="flex items-center overflow-hidden pl-0 pr-2 py-0.5 w-full">
            <Avatar className="h-7 w-7 flex-shrink-0">
              <AvatarImage src={user?.user_metadata?.avatar_url || ""} alt={displayName} />
              <AvatarFallback className="bg-gradient-to-br from-bg-400 to-bg-500 text-gray-600 text-sm font-bold">
                {userInitials || "U"}
              </AvatarFallback>
            </Avatar>
            <div className={cn(
              "transition-all duration-200 ease-in-out ml-3 flex-1 min-w-0 overflow-hidden",
              isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
            )}>
              <div className="truncate text-left text-sm font-medium text-gray-900 whitespace-nowrap tracking-wide font-manrope">
                {isLoading ? "Loading..." : displayName}
              </div>
              <div className="truncate text-left text-xs text-gray-500 whitespace-nowrap tracking-wide font-manrope">
                {email}
              </div>
            </div>
            <div className={cn(
              "transition-all duration-200 ease-in-out ml-auto flex-shrink-0 overflow-hidden",
              isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
            )}>
              <ChevronDown className="h-4 w-4 text-text-400" />
            </div>
          </div>
        </ProfileMenu>
      </div>
    </div>
  )
}

export default function TheSidebar({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    try {
      const savedState = localStorage.getItem('sidebar-collapsed')
      if (savedState !== null) {
        setSidebarCollapsed(JSON.parse(savedState))
      }
    } catch (error) {
      console.warn('Failed to load sidebar state:', error)
    }
    setIsHydrated(true)
  }, [])

  const updateSidebarCollapsed = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed)
    try {
      localStorage.setItem('sidebar-collapsed', JSON.stringify(collapsed))
    } catch (error) {
      console.warn('Failed to save sidebar state:', error)
    }
  }

  return (
    <div className="flex h-screen overflow-x-hidden">
      <AppSidebar isCollapsed={sidebarCollapsed} setIsCollapsed={updateSidebarCollapsed} />

      {/* Mobile overlay */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-[90] md:hidden"
          onClick={() => updateSidebarCollapsed(true)}
        />
      )}

      {/* Mobile menu button */}
      {sidebarCollapsed && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => updateSidebarCollapsed(false)}
          className="fixed top-3 left-2 z-[100] h-8 w-8 p-0 bg-white shadow-lg border md:hidden"
        >
          <PanelLeftOpen className="h-4 w-4" />
        </Button>
      )}

      <main className="flex-1 overflow-hidden md:ml-0 ml-0">
        <div className="h-full overflow-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
