"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  PanelLeft,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  LayoutDashboard,
  Lightbulb,
  Package,
  Settings,
  Check,
  Plus,
  Building2,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import ProfileMenu from "@/components/sidebar/profile-menu"
import { useUserContextValue } from "@/app/providers/UserContextProvider"

// Navigation items
const mainNavItems = [
  { title: "Overview", url: "/overview", icon: LayoutDashboard },
  { title: "Insights", url: "/insights", icon: Lightbulb },
  { title: "Products", url: "/products", icon: Package },
]

const settingsNavItems = [
  { title: "Settings", url: "/settings", icon: Settings },
]

function OrgBrandSelector({ isCollapsed }: { isCollapsed: boolean }) {
  const {
    organizations,
    brands,
    currentOrganization,
    currentBrand,
    switchOrganization,
    switchBrand,
    isLoading,
  } = useUserContextValue()

  if (isLoading) {
    return (
      <div className={cn(
        "px-3 py-3 border-b border-gray-200",
        isCollapsed && "px-2"
      )}>
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-text-400" />
          {!isCollapsed && <span className="text-sm text-text-400">Loading...</span>}
        </div>
      </div>
    )
  }

  if (!currentOrganization) {
    return (
      <div className={cn(
        "px-3 py-3 border-b border-gray-200",
        isCollapsed && "px-2"
      )}>
        {!isCollapsed && (
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Plus className="h-4 w-4 mr-2" />
            Create Organization
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className={cn(
      "border-b border-gray-200",
      isCollapsed ? "px-2 py-3" : "px-3 py-3"
    )}>
      {isCollapsed ? (
        // Collapsed state - show org icon only
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              title={`${currentOrganization.name} / ${currentBrand?.name || 'Select brand'}`}
            >
              {currentOrganization.logo_url ? (
                <Avatar className="h-6 w-6">
                  <AvatarImage src={currentOrganization.logo_url} alt={currentOrganization.name} />
                  <AvatarFallback className="text-xs bg-bg-300">
                    {currentOrganization.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <Building2 className="h-4 w-4 text-text-400" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Organization</DropdownMenuLabel>
            {organizations.map((org) => (
              <DropdownMenuItem
                key={org.id}
                onClick={() => switchOrganization(org.id)}
              >
                {org.id === currentOrganization.id && (
                  <Check className="h-4 w-4 mr-2" />
                )}
                <span className={org.id !== currentOrganization.id ? "ml-6" : ""}>
                  {org.name}
                </span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Brand</DropdownMenuLabel>
            {brands.map((brand) => (
              <DropdownMenuItem
                key={brand.id}
                onClick={() => switchBrand(brand.id)}
              >
                {brand.id === currentBrand?.id && (
                  <Check className="h-4 w-4 mr-2" />
                )}
                <span className={brand.id !== currentBrand?.id ? "ml-6" : ""}>
                  {brand.name}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        // Expanded state - show org name and brand selector
        <div className="space-y-2">
          {/* Organization Name */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 w-full text-left group hover:bg-bg-300 rounded-md px-2 py-1.5 transition-colors">
                {currentOrganization.logo_url ? (
                  <Avatar className="h-5 w-5 flex-shrink-0">
                    <AvatarImage src={currentOrganization.logo_url} alt={currentOrganization.name} />
                    <AvatarFallback className="text-xs bg-bg-300">
                      {currentOrganization.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <Building2 className="h-4 w-4 text-text-400 flex-shrink-0" />
                )}
                <span className="text-sm font-semibold text-gray-900 truncate font-manrope flex-1">
                  {currentOrganization.name}
                </span>
                <ChevronDown className="h-3 w-3 text-text-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Organizations</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {organizations.map((org) => (
                <DropdownMenuItem
                  key={org.id}
                  onClick={() => switchOrganization(org.id)}
                  className="cursor-pointer"
                >
                  {org.id === currentOrganization.id && (
                    <Check className="h-4 w-4 mr-2 text-green-600" />
                  )}
                  <span className={org.id !== currentOrganization.id ? "ml-6" : ""}>
                    {org.name}
                  </span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <Plus className="h-4 w-4 mr-2" />
                Create Organization
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Brand Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 w-full text-left group hover:bg-bg-300 rounded-md px-2 py-1.5 transition-colors">
                {currentBrand?.logo_url ? (
                  <Avatar className="h-5 w-5 flex-shrink-0">
                    <AvatarImage src={currentBrand.logo_url} alt={currentBrand.name} />
                    <AvatarFallback className="text-xs bg-bg-300">
                      {currentBrand.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="h-5 w-5 rounded bg-gradient-to-br from-accent-main-100 to-accent-main-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-accent-main-500">
                      {currentBrand?.name?.charAt(0).toUpperCase() || "?"}
                    </span>
                  </div>
                )}
                <span className="text-sm text-gray-700 truncate font-manrope flex-1">
                  {currentBrand?.name || "Select brand"}
                </span>
                <ChevronDown className="h-3 w-3 text-text-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Brands in {currentOrganization.name}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {brands.length === 0 ? (
                <DropdownMenuItem disabled>
                  <span className="text-text-400">No brands yet</span>
                </DropdownMenuItem>
              ) : (
                brands.map((brand) => (
                  <DropdownMenuItem
                    key={brand.id}
                    onClick={() => switchBrand(brand.id)}
                    className="cursor-pointer"
                  >
                    {brand.id === currentBrand?.id && (
                      <Check className="h-4 w-4 mr-2 text-green-600" />
                    )}
                    <span className={brand.id !== currentBrand?.id ? "ml-6" : ""}>
                      {brand.name}
                    </span>
                  </DropdownMenuItem>
                ))
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <Plus className="h-4 w-4 mr-2" />
                Add Brand
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  )
}

function AppSidebar({ isCollapsed, setIsCollapsed }: { isCollapsed: boolean; setIsCollapsed: (collapsed: boolean) => void }) {
  const pathname = usePathname()
  const { user, isLoading } = useUserContextValue()

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
      {/* Header with collapse button */}
      <div className="flex h-12 items-center border-b border-gray-200 px-2">
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
      </div>

      {/* Org/Brand Selector */}
      <OrgBrandSelector isCollapsed={isCollapsed} />

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-2">
        {/* Main Navigation */}
        <nav className="space-y-1 px-2">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.url || pathname.startsWith(item.url + '/')
            return (
              <Link
                key={item.title}
                href={item.url}
                onClick={handleNavigationClick}
                className={cn(
                  "flex items-center rounded-lg py-2 text-sm font-medium transition-all duration-200 relative overflow-hidden",
                  isActive
                    ? "bg-bg-400 text-gray-900"
                    : "text-gray-700 hover:bg-bg-300 hover:text-gray-900"
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

        {/* Settings Section */}
        <div className="mt-6">
          <nav className="space-y-1 px-2">
            {settingsNavItems.map((item) => {
              const isActive = pathname === item.url || pathname.startsWith(item.url + '/')
              return (
                <Link
                  key={item.title}
                  href={item.url}
                  onClick={handleNavigationClick}
                  className={cn(
                    "flex items-center rounded-lg py-2 text-sm font-medium transition-all duration-200 relative overflow-hidden",
                    isActive
                      ? "bg-bg-400 text-gray-900"
                      : "text-gray-700 hover:bg-bg-300 hover:text-gray-900"
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
        </div>
      </div>

      {/* User Profile */}
      <div className="border-t border-gray-200 pb-3 pt-3 px-2">
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
