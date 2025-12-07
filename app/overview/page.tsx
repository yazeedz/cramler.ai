"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { StatCard } from "@/components/dashboard/stat-card"
import { PlatformScoreCard } from "@/components/dashboard/platform-score-card"
import { BrandHeader } from "@/components/dashboard/brand-header"
import { useUserContextValue } from "@/app/providers/UserContextProvider"
import { createClient } from "@/app/utils/supabase/client"
import { TrendingUp, TrendingDown, Minus, ArrowRight, AlertCircle, Package } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Platform } from "@/components/dashboard/platform-icons"

interface BrandReport {
  overall_visibility_score: number | null
  visibility_change: number | null
  recommendation_rate: number | null
  share_of_voice: number | null
  chatgpt_score: number | null
  claude_score: number | null
  perplexity_score: number | null
  gemini_score: number | null
  copilot_score: number | null
}

interface Product {
  id: string
  name: string
  image_url?: string | null
  product_visibility_reports?: Array<{
    overall_visibility_score: number | null
    visibility_change: number | null
    total_mentions: number | null
    category_rank: number | null
  }>
}

interface Insight {
  id: string
  title: string
  priority: string
  recommendation_type: string
}

interface Competitor {
  id: string
  competitor_name: string
  share_of_voice: number | null
  sov_change: number | null
}

export default function OverviewPage() {
  const { currentBrand, isLoading: contextLoading } = useUserContextValue()
  const [isLoading, setIsLoading] = useState(true)
  const [report, setReport] = useState<BrandReport | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [productCount, setProductCount] = useState(0)
  const [insights, setInsights] = useState<Insight[]>([])
  const [competitors, setCompetitors] = useState<Competitor[]>([])

  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      if (!currentBrand) return

      setIsLoading(true)
      try {
        // Fetch all data in parallel
        const [reportRes, productsRes, countRes, insightsRes, competitorsRes] = await Promise.all([
          // Brand visibility report
          supabase
            .from("brand_visibility_reports")
            .select("*")
            .eq("brand_id", currentBrand.id)
            .order("report_date", { ascending: false })
            .limit(1)
            .maybeSingle(),

          // Top products with visibility
          supabase
            .from("products")
            .select(`
              id, name, image_url,
              product_visibility_reports (
                overall_visibility_score,
                visibility_change,
                total_mentions,
                category_rank
              )
            `)
            .eq("brand_id", currentBrand.id)
            .eq("is_active", true)
            .limit(5),

          // Product count
          supabase
            .from("products")
            .select("*", { count: "exact", head: true })
            .eq("brand_id", currentBrand.id)
            .eq("is_active", true),

          // Recent insights
          supabase
            .from("visibility_recommendations")
            .select("id, title, priority, recommendation_type")
            .eq("brand_id", currentBrand.id)
            .eq("status", "pending")
            .order("created_at", { ascending: false })
            .limit(3),

          // Competitors
          supabase
            .from("brand_competitors")
            .select("id, competitor_name, share_of_voice, sov_change")
            .eq("brand_id", currentBrand.id)
            .order("share_of_voice", { ascending: false })
            .limit(4),
        ])

        setReport(reportRes.data)

        // Sort products by visibility score
        const sortedProducts = (productsRes.data || []).sort((a, b) => {
          const scoreA = a.product_visibility_reports?.[0]?.overall_visibility_score || 0
          const scoreB = b.product_visibility_reports?.[0]?.overall_visibility_score || 0
          return scoreB - scoreA
        })
        setProducts(sortedProducts)

        setProductCount(countRes.count || 0)
        setInsights(insightsRes.data || [])
        setCompetitors(competitorsRes.data || [])
      } catch (error) {
        console.error("Failed to fetch overview data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [currentBrand, supabase])

  if (contextLoading) {
    return <OverviewSkeleton />
  }

  if (!currentBrand) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Brand Selected</h2>
          <p className="text-muted-foreground mb-4">
            Please select a brand from the sidebar to view the overview.
          </p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return <OverviewSkeleton />
  }

  const platforms: Platform[] = ["chatgpt", "claude", "perplexity", "gemini", "copilot"]
  const platformScores: Record<Platform, number | null> = {
    chatgpt: report?.chatgpt_score ?? null,
    claude: report?.claude_score ?? null,
    perplexity: report?.perplexity_score ?? null,
    gemini: report?.gemini_score ?? null,
    copilot: report?.copilot_score ?? null,
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold font-manrope">Overview</h1>
      </div>

      {/* Brand Header */}
      <BrandHeader brand={currentBrand} productCount={productCount} />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Visibility Score"
          value={report?.overall_visibility_score ?? "—"}
          change={report?.visibility_change ?? undefined}
          changeLabel="vs last week"
        />
        <StatCard
          title="Recommendation Rate"
          value={report?.recommendation_rate ? `${report.recommendation_rate}%` : "—"}
        />
        <StatCard
          title="Share of Voice"
          value={report?.share_of_voice ? `${report.share_of_voice}%` : "—"}
        />
      </div>

      {/* Platform Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="font-manrope">Platform Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {platforms.map((platform) => (
              <PlatformScoreCard
                key={platform}
                platform={platform}
                score={platformScores[platform]}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Products */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-manrope">Top Products</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/products" className="flex items-center gap-1">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No products yet</p>
              <Button variant="outline" size="sm" className="mt-4" asChild>
                <Link href="/products">Add your first product</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">#</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Product</th>
                    <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Score</th>
                    <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Change</th>
                    <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Mentions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => {
                    const report = product.product_visibility_reports?.[0]
                    const change = report?.visibility_change
                    return (
                      <tr key={product.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-3 px-2 text-sm text-muted-foreground">{index + 1}</td>
                        <td className="py-3 px-2">
                          <Link href={`/products/${product.id}`} className="font-medium hover:underline font-manrope">
                            {product.name}
                          </Link>
                        </td>
                        <td className="py-3 px-2 text-center font-semibold">
                          {report?.overall_visibility_score ?? "—"}
                        </td>
                        <td className="py-3 px-2 text-center">
                          {change !== null && change !== undefined ? (
                            <span className={cn(
                              "inline-flex items-center gap-1",
                              change > 0 ? "text-green-600" : change < 0 ? "text-red-600" : "text-muted-foreground"
                            )}>
                              {change > 0 ? <TrendingUp className="h-3 w-3" /> : change < 0 ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                              {change > 0 ? "+" : ""}{change}
                            </span>
                          ) : "—"}
                        </td>
                        <td className="py-3 px-2 text-center text-muted-foreground">
                          {report?.total_mentions ?? "—"}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bottom Grid: Insights & Competitors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recent Insights */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="font-manrope">Recent Insights</CardTitle>
              {insights.length > 0 && (
                <Badge variant="secondary">{insights.length}</Badge>
              )}
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/insights">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {insights.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">No pending insights</p>
            ) : (
              <div className="space-y-3">
                {insights.map((insight) => (
                  <div key={insight.id} className="flex items-start gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                      insight.priority === "high" ? "bg-red-500" :
                      insight.priority === "medium" ? "bg-yellow-500" : "bg-blue-500"
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{insight.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {insight.priority} priority
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Competitors */}
        <Card>
          <CardHeader>
            <CardTitle className="font-manrope">Top Competitors</CardTitle>
          </CardHeader>
          <CardContent>
            {competitors.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">No competitors tracked</p>
            ) : (
              <div className="space-y-3">
                {competitors.map((competitor, index) => (
                  <div key={competitor.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground w-4">{index + 1}.</span>
                      <span className="font-medium">{competitor.competitor_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        {competitor.share_of_voice ? `${competitor.share_of_voice}% SOV` : "—"}
                      </span>
                      {competitor.sov_change !== null && competitor.sov_change !== undefined && (
                        <span className={cn(
                          "text-xs",
                          competitor.sov_change > 0 ? "text-green-600" : competitor.sov_change < 0 ? "text-red-600" : "text-muted-foreground"
                        )}>
                          {competitor.sov_change > 0 ? "+" : ""}{competitor.sov_change}%
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function OverviewSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-28 w-full" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
      <Skeleton className="h-48" />
      <Skeleton className="h-64" />
    </div>
  )
}
