"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  className?: string
}

export function StatCard({ title, value, change, changeLabel = "vs last week", className }: StatCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground font-manrope">{title}</p>
        <p className="text-3xl font-bold mt-1 font-manrope">{value}</p>
        {change !== undefined && (
          <div className={cn(
            "flex items-center gap-1 mt-2 text-sm",
            change > 0 ? "text-green-600" : change < 0 ? "text-red-600" : "text-muted-foreground"
          )}>
            {change > 0 ? (
              <TrendingUp className="h-4 w-4" />
            ) : change < 0 ? (
              <TrendingDown className="h-4 w-4" />
            ) : (
              <Minus className="h-4 w-4" />
            )}
            <span>
              {change > 0 ? "+" : ""}{change} {changeLabel}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
