"use client"

import React, { createContext, useContext, ReactNode } from "react"
import { useUserContext, UserContext } from "@/app/hooks/useUserContext"

const UserContextContext = createContext<UserContext | null>(null)

export function UserContextProvider({ children }: { children: ReactNode }) {
  const userContext = useUserContext()

  return (
    <UserContextContext.Provider value={userContext}>
      {children}
    </UserContextContext.Provider>
  )
}

export function useUserContextValue(): UserContext {
  const context = useContext(UserContextContext)
  if (!context) {
    throw new Error("useUserContextValue must be used within a UserContextProvider")
  }
  return context
}
