"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Platform, PlatformIcon, getPlatformName } from "./platform-icons"

interface PlatformScoreCardProps {
  platform: Platform
  score: number | null
  change?: number | null
  className?: string
}

export function PlatformScoreCard({ platform, score, change, className }: PlatformScoreCardProps) {
  return (
    <Card className={cn("text-center", className)}>
      <CardContent className="pt-6 pb-4">
        <div className="flex justify-center mb-2">
          <PlatformIcon platform={platform} className="w-8 h-8" />
        </div>
        <p className="text-sm text-muted-foreground font-manrope">{getPlatformName(platform)}</p>
        <p className="text-2xl font-bold mt-1 font-manrope">
          {score !== null ? score : "—"}
        </p>
        {change !== null && change !== undefined && (
          <div className={cn(
            "flex items-center justify-center gap-1 mt-1 text-sm",
            change > 0 ? "text-green-600" : change < 0 ? "text-red-600" : "text-muted-foreground"
          )}>
            {change > 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : change < 0 ? (
              <TrendingDown className="h-3 w-3" />
            ) : (
              <Minus className="h-3 w-3" />
            )}
            <span>{change > 0 ? "+" : ""}{change}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
