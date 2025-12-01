import * as React from "react"
import { Archive } from "lucide-react"
import { cn } from "@/lib/utils"

interface ArchiveSwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

export function ArchiveSwitch({ checked, onCheckedChange }: ArchiveSwitchProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative h-7 w-14 rounded-full transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        checked ? "bg-primary" : "bg-input"
      )}
    >
      <div
        className={cn(
          "absolute h-6 w-6 rounded-full bg-background flex items-center justify-center",
          "transition-transform top-0.5",
          checked ? "translate-x-7" : "translate-x-0.5"
        )}
      >
        <Archive 
          className={cn(
            "h-4 w-4 transition-colors",
            checked ? "text-primary" : "text-muted-foreground"
          )}
        />
      </div>
    </button>
  )
} 