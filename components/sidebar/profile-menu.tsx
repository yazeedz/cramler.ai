"use client";

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"

interface ProfileMenuProps {
  displayName: string
  userInitials: string
  email: string
  isCollapsed: boolean
  children: React.ReactNode
}

export default function ProfileMenu({
  displayName,
  userInitials,
  email,
  isCollapsed,
  children
}: ProfileMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <DropdownMenu onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={`h-auto w-full p-0 hover:bg-bg-400 focus:outline-none focus:ring-0 focus-visible:ring-0 rounded-md ${isMenuOpen ? 'bg-bg-300' : ''}`}
        >
          {children}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[calc(17rem)] mx-2 mb-1 left font-manrope z-[110]"
        side={"bottom"}
        align={"end"}
        sideOffset={0}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="text-text-500 pt-1 px-2 text-sm pb-2 overflow-ellipsis truncate">{email}</div>
          <div className="flex items-center gap-2 px-2 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8">
              <AvatarImage src="" alt={displayName} />
              <AvatarFallback className="bg-gradient-to-br from-bg-400 to-bg-500 text-gray-600 text-sm font-bold">
                {userInitials || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden grow">
              <div className="flex items-center gap-2">
                <span className="truncate text-text-100 text-sm font-bold">
                  {displayName}
                </span>
              </div>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/logout" className="flex items-center gap-2 cursor-pointer">
            <span className="flex items-center">Log out</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
