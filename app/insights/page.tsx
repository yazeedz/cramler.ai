"use client"

import React, { useEffect, useState, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PlatformIcon, Platform, getPlatformName } from "@/components/dashboard/platform-icons"
import { useUserContextValue } from "@/app/providers/UserContextProvider"
import { createClient } from "@/app/utils/supabase/client"
import {
  AlertCircle,
  TrendingUp,
  TrendingDown,
  MessageSquareText,
  GitBranch,
  Monitor,
  Globe,
  UserCircle,
  ShoppingCart,
  Heart,
  Link2,
  Users,
  ExternalLink,
  Building2,
  BarChart3,
  Search,
  Info,
  ChevronDown,
  Download,
  Hash,
  Layers,
  FolderOpen,
  Sparkles,
} from "lucide-react"
import { GeneratePromptsDialog } from "@/components/dashboard/GeneratePromptsDialog"
import { cn } from "@/lib/utils"
import { format, formatDistanceToNow, subDays, parseISO } from "date-fns"

interface Competitor {
  id: string
  competitor_name: string
  competitor_type: string | null
  website: string | null
  description: string | null
  similarity_reason: string | null
  notes: string | null
  created_at: string | null
}

interface VisibilityQuery {
  id: string
  ai_platform: string
  query_text: string
  response_text: string | null
  mention_position: number | null
  sentiment: string | null
  queried_at: string
  products?: { id: string; name: string } | null
  competitors_mentioned: string[] | null
}

interface BrandVisibilityReport {
  id: string
  brand_id: string
  report_date: string
  report_period: string | null
  overall_visibility_score: number | null
  visibility_change: number | null
  chatgpt_score: number | null
  claude_score: number | null
  gemini_score: number | null
  perplexity_score: number | null
  copilot_score: number | null
  total_mentions: number | null
  competitive_rank: number | null
}

interface CompetitorVisibilityReport {
  id: string
  competitor_id: string
  brand_id: string
  report_date: string
  overall_visibility_score: number | null
  visibility_change: number | null
  competitive_rank: number | null
  brand_competitors?: {
    id: string
    competitor_name: string
    website: string | null
  }
}

interface BrandResearchTopic {
  id: string
  brand_id: string
  name: string
  slug: string
  description: string | null
  prompt_count: number | null
  is_active: boolean | null
  sort_order: number | null
}

interface BrandResearchPrompt {
  id: string
  brand_id: string
  topic_id: string
  prompt_text: string
  visibility_rank: number | null
  visibility_score: number | null
  average_position: number | null
  citation_share: number | null
  last_run_at: string | null
  is_active: boolean | null
}

type DateRange = "7d" | "14d" | "30d" | "90d"
type Granularity = "daily" | "weekly" | "monthly"

export default function InsightsPage() {
  const { currentBrand, user, isLoading: contextLoading } = useUserContextValue()
  const [isLoading, setIsLoading] = useState(true)
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [responses, setResponses] = useState<VisibilityQuery[]>([])
  const [brandVisibilityReports, setBrandVisibilityReports] = useState<BrandVisibilityReport[]>([])
  const [competitorVisibilityReports, setCompetitorVisibilityReports] = useState<CompetitorVisibilityReport[]>([])
  const [researchTopics, setResearchTopics] = useState<BrandResearchTopic[]>([])
  const [researchPrompts, setResearchPrompts] = useState<BrandResearchPrompt[]>([])
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set())
  const [generatePromptsDialogOpen, setGeneratePromptsDialogOpen] = useState(false)

  // Toggle topic expansion
  const toggleTopicExpanded = useCallback((topicId: string) => {
    setExpandedTopics(prev => {
      const next = new Set(prev)
      if (next.has(topicId)) {
        next.delete(topicId)
      } else {
        next.add(topicId)
      }
      return next
    })
  }, [])

  // Visibility tab filters
  const [dateRange, setDateRange] = useState<DateRange>("7d")
  const [granularity, setGranularity] = useState<Granularity>("daily")
  const [compareCompetitors, setCompareCompetitors] = useState(false)

  const supabase = createClient()

  // Handle prompt generation completion
  const handlePromptsGenerated = useCallback(async () => {
    if (!currentBrand) return

    // Refetch topics and prompts
    const [topicsRes, promptsRes] = await Promise.all([
      supabase
        .from("brand_research_topics")
        .select("*")
        .eq("brand_id", currentBrand.id)
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("brand_research_prompts")
        .select("*")
        .eq("brand_id", currentBrand.id)
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
    ])

    setResearchTopics(topicsRes.data || [])
    setResearchPrompts(promptsRes.data || [])

    // Expand all topics
    if (topicsRes.data && topicsRes.data.length > 0) {
      setExpandedTopics(new Set(topicsRes.data.map((t: BrandResearchTopic) => t.id)))
    }
  }, [currentBrand, supabase])

  // Calculate date range for queries
  const dateRangeConfig = useMemo(() => {
    const days = dateRange === "7d" ? 6 : dateRange === "14d" ? 13 : dateRange === "30d" ? 29 : 89
    return {
      startDate: format(subDays(new Date(), days), "yyyy-MM-dd"),
      endDate: format(new Date(), "yyyy-MM-dd"),
      label: dateRange === "7d" ? "Last 6 Days" : dateRange === "14d" ? "Last 14 Days" : dateRange === "30d" ? "Last 30 Days" : "Last 90 Days"
    }
  }, [dateRange])

  useEffect(() => {
    async function fetchData() {
      if (!currentBrand) return

      setIsLoading(true)
      try {
        const [compsRes, responsesRes, brandVisRes, compVisRes, topicsRes, promptsRes] = await Promise.all([
          // Competitors
          supabase
            .from("brand_competitors")
            .select("*")
            .eq("brand_id", currentBrand.id)
            .order("created_at", { ascending: false }),

          // Recent AI responses
          supabase
            .from("visibility_queries")
            .select(`
              *,
              products (id, name)
            `)
            .eq("brand_id", currentBrand.id)
            .order("queried_at", { ascending: false })
            .limit(50),

          // Brand visibility reports
          supabase
            .from("brand_visibility_reports")
            .select("*")
            .eq("brand_id", currentBrand.id)
            .gte("report_date", dateRangeConfig.startDate)
            .lte("report_date", dateRangeConfig.endDate)
            .order("report_date", { ascending: true }),

          // Competitor visibility reports
          supabase
            .from("competitor_brand_visibility_reports")
            .select(`
              *,
              brand_competitors (id, competitor_name, website)
            `)
            .eq("brand_id", currentBrand.id)
            .gte("report_date", dateRangeConfig.startDate)
            .lte("report_date", dateRangeConfig.endDate)
            .order("report_date", { ascending: true }),

          // Research topics
          supabase
            .from("brand_research_topics")
            .select("*")
            .eq("brand_id", currentBrand.id)
            .eq("is_active", true)
            .order("sort_order", { ascending: true }),

          // Research prompts
          supabase
            .from("brand_research_prompts")
            .select("*")
            .eq("brand_id", currentBrand.id)
            .eq("is_active", true)
            .order("sort_order", { ascending: true }),
        ])

        setCompetitors(compsRes.data || [])
        setResponses(responsesRes.data || [])
        setBrandVisibilityReports(brandVisRes.data || [])
        setCompetitorVisibilityReports(compVisRes.data || [])
        setResearchTopics(topicsRes.data || [])
        setResearchPrompts(promptsRes.data || [])

        // Expand all topics by default
        if (topicsRes.data && topicsRes.data.length > 0) {
          setExpandedTopics(new Set(topicsRes.data.map((t: BrandResearchTopic) => t.id)))
        }
      } catch (error) {
        console.error("Failed to fetch insights data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [currentBrand, supabase, dateRangeConfig])

  // Get competitor rankings (latest scores) - must be before early returns
  const competitorRankings = useMemo(() => {
    // Group by competitor and get latest report
    const latestByCompetitor = new Map<string, CompetitorVisibilityReport>()
    competitorVisibilityReports.forEach(report => {
      const existing = latestByCompetitor.get(report.competitor_id)
      if (!existing || report.report_date > existing.report_date) {
        latestByCompetitor.set(report.competitor_id, report)
      }
    })

    // Convert to array and sort by visibility score
    return Array.from(latestByCompetitor.values())
      .sort((a, b) => (b.overall_visibility_score ?? 0) - (a.overall_visibility_score ?? 0))
      .slice(0, 10)
  }, [competitorVisibilityReports])

  // Chart data for visibility over time
  const chartData = useMemo(() => {
    // Generate date labels for the selected range
    const days = dateRange === "7d" ? 6 : dateRange === "14d" ? 13 : dateRange === "30d" ? 29 : 89
    const dates: string[] = []
    for (let i = days; i >= 0; i--) {
      dates.push(format(subDays(new Date(), i), "yyyy-MM-dd"))
    }

    // Map brand visibility reports by date
    const brandDataByDate = new Map(
      brandVisibilityReports.map(r => [r.report_date, r.overall_visibility_score ?? 0])
    )

    // Map competitor reports by date and competitor
    const competitorDataByDate = new Map<string, Map<string, number>>()
    competitorVisibilityReports.forEach(r => {
      if (!competitorDataByDate.has(r.report_date)) {
        competitorDataByDate.set(r.report_date, new Map())
      }
      const competitorName = r.brand_competitors?.competitor_name || "Unknown"
      competitorDataByDate.get(r.report_date)?.set(competitorName, r.overall_visibility_score ?? 0)
    })

    return dates.map(date => ({
      date,
      label: format(parseISO(date), "MMM d"),
      brandScore: brandDataByDate.get(date) ?? 0,
      competitors: competitorDataByDate.get(date) || new Map()
    }))
  }, [brandVisibilityReports, competitorVisibilityReports, dateRange])

  // Get max value for chart scaling
  const chartMaxValue = useMemo(() => {
    let max = 0
    chartData.forEach(d => {
      max = Math.max(max, d.brandScore)
      d.competitors.forEach(score => {
        max = Math.max(max, score)
      })
    })
    return Math.max(max, 1) // At least 1 to avoid division by zero
  }, [chartData])

  // Early returns after all hooks
  if (contextLoading) {
    return <InsightsSkeleton />
  }

  if (!currentBrand) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Brand Selected</h2>
          <p className="text-muted-foreground mb-4">
            Please select a brand from the sidebar to view insights.
          </p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return <InsightsSkeleton />
  }

  // Calculate stats from responses
  const mentionedResponses = responses.filter(r => r.mention_position !== null)
  const platformCounts = responses.reduce((acc, r) => {
    const platform = r.ai_platform.toLowerCase()
    acc[platform] = (acc[platform] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const sentimentCounts = responses.reduce((acc, r) => {
    if (r.sentiment) {
      acc[r.sentiment] = (acc[r.sentiment] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  // Current visibility score (latest report)
  const latestBrandReport = brandVisibilityReports[brandVisibilityReports.length - 1]
  const currentVisibilityScore = latestBrandReport?.overall_visibility_score ?? 0
  const visibilityChange = latestBrandReport?.visibility_change ?? null
  const currentRank = latestBrandReport?.competitive_rank ?? 0

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
          <span className="text-lg font-bold">{currentBrand.name.charAt(0)}</span>
        </div>
        <h1 className="text-2xl font-bold font-manrope">{currentBrand.name}</h1>
      </div>

      {/* Navigation Tabs */}
      <Tabs defaultValue="visibility" className="space-y-6">
        <div className="border-b">
          <TabsList className="h-auto p-0 bg-transparent gap-0">
            <TabsTrigger
              value="visibility"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
            >
              Visibility
            </TabsTrigger>
            <TabsTrigger
              value="prompts"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
            >
              Prompts
            </TabsTrigger>
            <TabsTrigger
              value="query-fanouts"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
            >
              Query Fanouts
            </TabsTrigger>
            <TabsTrigger
              value="platforms"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
            >
              Platforms
            </TabsTrigger>
            <TabsTrigger
              value="regions"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
            >
              Regions
            </TabsTrigger>
            <TabsTrigger
              value="personas"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
            >
              Personas
            </TabsTrigger>
            <TabsTrigger
              value="shopping"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 gap-2"
            >
              Shopping
              <Badge variant="secondary" className="text-xs">Beta</Badge>
            </TabsTrigger>
            <TabsTrigger
              value="sentiment"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
            >
              Sentiment
            </TabsTrigger>
            <TabsTrigger
              value="citations"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
            >
              Citations
            </TabsTrigger>
            <TabsTrigger
              value="competitors"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
            >
              Competitors
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Visibility Tab */}
        <TabsContent value="visibility" className="space-y-6">
          {/* Filter Bar */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 6 Days</SelectItem>
                  <SelectItem value="14d">Last 14 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="90d">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>

              <Select value={granularity} onValueChange={(v) => setGranularity(v as Granularity)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Granularity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Hash className="h-4 w-4 mr-2" />
                    Topics
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="p-4 min-w-[200px]">
                  <p className="text-sm text-muted-foreground text-center py-4">No topics configured</p>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Layers className="h-4 w-4 mr-2" />
                    Platforms
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="p-4 min-w-[200px]">
                  <p className="text-sm text-muted-foreground text-center py-4">All platforms selected</p>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Visibility Score Chart - Left Side (2 cols) */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-medium">Visibility Score</CardTitle>
                    <button className="text-muted-foreground hover:text-foreground">
                      <Info className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-4xl font-bold">{currentVisibilityScore.toFixed(1)}%</span>
                  {visibilityChange !== null && (
                    <span className={cn(
                      "text-sm flex items-center",
                      visibilityChange >= 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {visibilityChange >= 0 ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {visibilityChange >= 0 ? "+" : ""}{visibilityChange.toFixed(1)}%
                    </span>
                  )}
                  {visibilityChange === null && (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {/* Simple Line Chart Visualization */}
                <div className="mt-4">
                  {/* Y-axis labels */}
                  <div className="flex">
                    <div className="w-10 flex flex-col justify-between text-xs text-muted-foreground pr-2 h-[200px]">
                      <span>{chartMaxValue.toFixed(0)}%</span>
                      <span>{(chartMaxValue * 0.5).toFixed(0)}%</span>
                      <span>0%</span>
                    </div>

                    {/* Chart Area */}
                    <div className="flex-1 relative h-[200px] border-l border-b border-muted">
                      {/* Grid lines */}
                      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                        <div className="border-b border-dashed border-muted/50" />
                        <div className="border-b border-dashed border-muted/50" />
                      </div>

                      {/* Brand line chart */}
                      <svg className="absolute inset-0 w-full h-full overflow-visible">
                        {/* Brand visibility line */}
                        <polyline
                          fill="none"
                          stroke="hsl(var(--primary))"
                          strokeWidth="2"
                          points={chartData.map((d, i) => {
                            const x = (i / (chartData.length - 1)) * 100
                            const y = 100 - (d.brandScore / chartMaxValue) * 100
                            return `${x}%,${y}%`
                          }).join(' ')}
                        />
                        {/* Data points */}
                        {chartData.map((d, i) => {
                          const x = (i / (chartData.length - 1)) * 100
                          const y = 100 - (d.brandScore / chartMaxValue) * 100
                          return (
                            <circle
                              key={i}
                              cx={`${x}%`}
                              cy={`${y}%`}
                              r="4"
                              fill="hsl(var(--primary))"
                              className="cursor-pointer hover:r-6"
                            />
                          )
                        })}
                      </svg>
                    </div>
                  </div>

                  {/* X-axis labels */}
                  <div className="flex ml-10 mt-2">
                    {chartData.filter((_, i) => i % Math.ceil(chartData.length / 6) === 0 || i === chartData.length - 1).map((d, i) => (
                      <span key={i} className="text-xs text-muted-foreground flex-1 text-center first:text-left last:text-right">
                        {d.label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-6 mt-6 pt-4 border-t">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox checked disabled />
                    <span className="text-sm">Current Period</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={compareCompetitors}
                      onCheckedChange={(checked) => setCompareCompetitors(checked === true)}
                    />
                    <span className="text-sm">Compare competitors</span>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Visibility Score Rank - Right Side */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base font-medium">Visibility Score Rank</CardTitle>
                  <button className="text-muted-foreground hover:text-foreground">
                    <Info className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-4xl font-bold">#{currentRank || 0}</span>
                  <span className="text-sm text-muted-foreground">-</span>
                </div>
              </CardHeader>
              <CardContent>
                {/* Rankings Table */}
                <div className="mt-4 space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground pb-2 border-b">
                    <span>Asset</span>
                    <span>Visibility Score</span>
                  </div>

                  {competitorRankings.length === 0 && competitors.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                      <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No competitor data yet</p>
                    </div>
                  ) : competitorRankings.length === 0 ? (
                    // Show competitors without scores - no rank numbers yet
                    <div className="space-y-3 py-2">
                      {competitors.slice(0, 4).map((comp) => {
                        const faviconUrl = comp.website
                          ? `https://www.google.com/s2/favicons?domain=${comp.website.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]}&sz=32`
                          : null
                        return (
                          <div key={comp.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-muted-foreground w-4">-</span>
                              {faviconUrl ? (
                                <img src={faviconUrl} alt="" className="w-5 h-5 rounded" />
                              ) : (
                                <div className="w-5 h-5 rounded bg-muted flex items-center justify-center">
                                  <Building2 className="h-3 w-3 text-muted-foreground" />
                                </div>
                              )}
                              <span className="text-sm font-medium">{comp.competitor_name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">-</span>
                              <span className="text-xs text-muted-foreground">-</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    // Show competitor rankings with scores
                    <div className="space-y-3 py-2">
                      {competitorRankings.map((ranking, idx) => {
                        const website = ranking.brand_competitors?.website
                        const faviconUrl = website
                          ? `https://www.google.com/s2/favicons?domain=${website.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]}&sz=32`
                          : null
                        return (
                          <div key={ranking.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-muted-foreground w-4">{idx + 1}.</span>
                              {faviconUrl ? (
                                <img src={faviconUrl} alt="" className="w-5 h-5 rounded" />
                              ) : (
                                <div className="w-5 h-5 rounded bg-muted flex items-center justify-center">
                                  <Building2 className="h-3 w-3 text-muted-foreground" />
                                </div>
                              )}
                              <span className="text-sm font-medium">{ranking.brand_competitors?.competitor_name || "Unknown"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{(ranking.overall_visibility_score ?? 0).toFixed(1)}%</span>
                              <span className="text-xs text-muted-foreground">-</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Expand button */}
                {(competitorRankings.length > 4 || competitors.length > 4) && (
                  <div className="mt-4 pt-4 border-t">
                    <Button variant="outline" size="sm" className="w-full">
                      Expand
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Export Button */}
          <div className="flex justify-end">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export {responses.length > 0 ? `${(responses.length / 1000).toFixed(1)}k` : "0"} answers
            </Button>
          </div>
        </TabsContent>

        {/* Prompts Tab */}
        <TabsContent value="prompts" className="space-y-6">
          {/* Filter Bar */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 6 Days</SelectItem>
                  <SelectItem value="14d">Last 14 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="90d">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Group by: Topic
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <div className="p-2 text-sm text-muted-foreground">Grouping options coming soon</div>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Customize Columns
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <div className="p-2 text-sm text-muted-foreground">Column options coming soon</div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search Topics"
                  className="pl-9 pr-4 py-2 text-sm border rounded-md w-[200px] bg-background"
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Hash className="h-4 w-4 mr-2" />
                    Topics
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="p-4 min-w-[200px]">
                  <p className="text-sm text-muted-foreground text-center py-4">All topics selected</p>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Layers className="h-4 w-4 mr-2" />
                    Platforms
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="p-4 min-w-[200px]">
                  <p className="text-sm text-muted-foreground text-center py-4">All platforms selected</p>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Summary Bar */}
          <div className="flex items-center justify-between py-3 px-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              The {currentBrand?.name} configuration includes {researchPrompts.length} visibility prompts across {researchTopics.length} topics, which are run daily.
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="sm"
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => setGeneratePromptsDialogOpen(true)}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Prompts
              </Button>
              <Button variant="outline" size="sm">
                Modify Prompts
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Generate Prompts Dialog */}
          <GeneratePromptsDialog
            open={generatePromptsDialogOpen}
            onOpenChange={setGeneratePromptsDialogOpen}
            brand={currentBrand ? {
              id: currentBrand.id,
              name: currentBrand.name,
              description: currentBrand.description || undefined,
              organization_id: currentBrand.organization_id
            } : null}
            competitors={competitors.map(c => ({ name: c.competitor_name }))}
            userId={user?.id || null}
            onComplete={handlePromptsGenerated}
          />

          {/* Prompts Table with Topic Groups */}
          {researchTopics.length === 0 && researchPrompts.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="py-12 text-center">
                  <MessageSquareText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No prompts configured</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-6">
                    Generate AI visibility research prompts to track how AI assistants like ChatGPT, Claude, and Perplexity recommend your brand.
                  </p>
                  <Button
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={() => setGeneratePromptsDialogOpen(true)}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Prompts
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="border rounded-lg overflow-hidden bg-background">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        Topic
                        <button className="text-muted-foreground hover:text-foreground">
                          <Info className="h-3 w-3" />
                        </button>
                      </div>
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider w-32">
                      Visibility Rank
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider w-32">
                      <div className="flex items-center justify-center gap-1">
                        Visibility Score
                      </div>
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider w-32">
                      <div className="flex items-center justify-center gap-1">
                        Average Position
                        <button className="text-muted-foreground hover:text-foreground">
                          <Info className="h-3 w-3" />
                        </button>
                      </div>
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider w-32">
                      <div className="flex items-center justify-center gap-1">
                        Citation Share
                        <button className="text-muted-foreground hover:text-foreground">
                          <Info className="h-3 w-3" />
                        </button>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {researchTopics.map((topic) => {
                    const topicPrompts = researchPrompts.filter(p => p.topic_id === topic.id)
                    const isExpanded = expandedTopics.has(topic.id)

                    // Calculate topic-level aggregates
                    const avgVisibilityScore = topicPrompts.length > 0
                      ? topicPrompts.reduce((sum, p) => sum + (p.visibility_score ?? 0), 0) / topicPrompts.length
                      : 0
                    const avgCitationShare = topicPrompts.length > 0
                      ? topicPrompts.reduce((sum, p) => sum + (p.citation_share ?? 0), 0) / topicPrompts.length
                      : 0

                    return (
                      <React.Fragment key={topic.id}>
                        {/* Topic Row */}
                        <tr
                          className="bg-muted/20 border-b cursor-pointer hover:bg-muted/40 transition-colors"
                          onClick={() => toggleTopicExpanded(topic.id)}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <ChevronDown className={cn(
                                "h-4 w-4 transition-transform",
                                !isExpanded && "-rotate-90"
                              )} />
                              <div>
                                <p className="font-medium">{topic.name}</p>
                                <p className="text-xs text-muted-foreground">{topicPrompts.length} prompts</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center text-muted-foreground">- -</td>
                          <td className="px-4 py-3 text-center">
                            <span className="font-medium">{avgVisibilityScore.toFixed(0)}%</span>
                            <span className="text-muted-foreground ml-1">-</span>
                          </td>
                          <td className="px-4 py-3 text-center text-muted-foreground">- -</td>
                          <td className="px-4 py-3 text-center">
                            <span className="font-medium">{avgCitationShare.toFixed(0)}%</span>
                            <span className="text-muted-foreground ml-1">-</span>
                          </td>
                        </tr>
                        {/* Prompt Rows */}
                        {isExpanded && topicPrompts.map((prompt) => (
                          <tr key={prompt.id} className="border-b hover:bg-muted/10 transition-colors">
                            <td className="px-4 py-3 pl-10">
                              <p className="text-sm">{prompt.prompt_text}</p>
                            </td>
                            <td className="px-4 py-3 text-center text-muted-foreground">- -</td>
                            <td className="px-4 py-3 text-center">
                              <span className="font-medium">{prompt.visibility_score?.toFixed(0) ?? 0}%</span>
                              <span className="text-muted-foreground ml-1">-</span>
                            </td>
                            <td className="px-4 py-3 text-center text-muted-foreground">- -</td>
                            <td className="px-4 py-3 text-center">
                              <span className="font-medium">{prompt.citation_share?.toFixed(0) ?? 0}%</span>
                              <span className="text-muted-foreground ml-1">-</span>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        {/* Query Fanouts Tab */}
        <TabsContent value="query-fanouts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Query Fanouts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon={GitBranch}
                title="No query fanouts yet"
                description="Query fanouts show how different variations of prompts affect AI responses"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Platforms Tab */}
        <TabsContent value="platforms" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {["chatgpt", "claude", "gemini", "perplexity"].map((platform) => (
              <Card key={platform}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <PlatformIcon platform={platform as Platform} className="w-8 h-8" />
                    <span className="font-semibold">{getPlatformName(platform as Platform)}</span>
                  </div>
                  <p className="text-3xl font-bold">{platformCounts[platform] || 0}</p>
                  <p className="text-sm text-muted-foreground mt-1">queries tracked</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Platform Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(platformCounts).length === 0 ? (
                <EmptyState
                  icon={Monitor}
                  title="No platform data yet"
                  description="Track queries across different AI platforms to compare visibility"
                />
              ) : (
                <div className="space-y-4">
                  {Object.entries(platformCounts).map(([platform, count]) => (
                    <div key={platform} className="flex items-center gap-4">
                      <PlatformIcon platform={platform as Platform} className="w-6 h-6" />
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">{getPlatformName(platform as Platform)}</span>
                          <span className="text-muted-foreground">{count} queries</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${(count / responses.length) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Regions Tab */}
        <TabsContent value="regions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Regional Visibility
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon={Globe}
                title="No regional data yet"
                description="Track how your brand appears in different geographic regions"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Personas Tab */}
        <TabsContent value="personas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCircle className="h-5 w-5" />
                Persona Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon={UserCircle}
                title="No personas configured"
                description="Define user personas to see how AI recommendations vary by audience"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shopping Tab */}
        <TabsContent value="shopping" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Shopping Queries
                <Badge variant="secondary">Beta</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon={ShoppingCart}
                title="Shopping analysis coming soon"
                description="Track how your products appear in AI-powered shopping recommendations"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sentiment Tab */}
        <TabsContent value="sentiment" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-green-600 mb-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-medium">Positive</span>
                </div>
                <p className="text-3xl font-bold text-green-700">{sentimentCounts.positive || 0}</p>
                <p className="text-sm text-green-600/70">mentions</p>
              </CardContent>
            </Card>
            <Card className="border-gray-200 bg-gray-50/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <TrendingDown className="h-4 w-4 rotate-90" />
                  <span className="text-sm font-medium">Neutral</span>
                </div>
                <p className="text-3xl font-bold text-gray-700">{sentimentCounts.neutral || 0}</p>
                <p className="text-sm text-gray-600/70">mentions</p>
              </CardContent>
            </Card>
            <Card className="border-red-200 bg-red-50/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-red-600 mb-2">
                  <TrendingDown className="h-4 w-4" />
                  <span className="text-sm font-medium">Negative</span>
                </div>
                <p className="text-3xl font-bold text-red-700">{sentimentCounts.negative || 0}</p>
                <p className="text-sm text-red-600/70">mentions</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Sentiment Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(sentimentCounts).length === 0 ? (
                <EmptyState
                  icon={Heart}
                  title="No sentiment data yet"
                  description="Track AI responses to analyze sentiment towards your brand"
                />
              ) : (
                <div className="space-y-4">
                  {responses
                    .filter(r => r.sentiment)
                    .slice(0, 10)
                    .map((response) => (
                      <QueryCard key={response.id} response={response} showSentiment />
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Citations Tab */}
        <TabsContent value="citations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5" />
                Source Citations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon={Link2}
                title="No citations tracked yet"
                description="See which sources AI models cite when mentioning your brand"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Competitors Tab */}
        <TabsContent value="competitors" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Tracked Competitors
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Companies you're monitoring in AI responses
                </p>
              </div>
              <Badge variant="secondary">{competitors.length} competitors</Badge>
            </CardHeader>
            <CardContent>
              {competitors.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No competitors tracked yet"
                  description="Competitors are automatically added during onboarding. You can also add them manually."
                />
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {competitors.map((competitor) => (
                    <CompetitorCard key={competitor.id} competitor={competitor} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}) {
  return (
    <div className="py-12 text-center">
      <Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md mx-auto">{description}</p>
    </div>
  )
}

function QueryCard({ response, showSentiment = false }: { response: VisibilityQuery; showSentiment?: boolean }) {
  const platform = response.ai_platform.toLowerCase() as Platform
  const sentimentColors = {
    positive: "text-green-600 bg-green-100",
    neutral: "text-gray-600 bg-gray-100",
    negative: "text-red-600 bg-red-100",
  }

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <PlatformIcon platform={platform} className="w-5 h-5" />
          <span className="font-medium">{getPlatformName(platform)}</span>
          {showSentiment && response.sentiment && (
            <Badge className={cn("text-xs", sentimentColors[response.sentiment as keyof typeof sentimentColors])}>
              {response.sentiment}
            </Badge>
          )}
        </div>
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(response.queried_at), { addSuffix: true })}
        </span>
      </div>
      <p className="text-sm text-muted-foreground mb-2">
        "{response.query_text}"
      </p>
      {response.response_text && (
        <p className="text-sm bg-muted p-3 rounded mb-3 line-clamp-3">
          {response.response_text}
        </p>
      )}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        {response.mention_position && (
          <span className="flex items-center gap-1">
            <BarChart3 className="h-3 w-3" />
            Position #{response.mention_position}
          </span>
        )}
        {response.products && (
          <span>Product: {response.products.name}</span>
        )}
      </div>
    </div>
  )
}

function CompetitorCard({ competitor }: { competitor: Competitor }) {
  const getFaviconUrl = (website: string | null) => {
    if (!website) return null
    try {
      const domain = website.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
    } catch {
      return null
    }
  }

  const faviconUrl = getFaviconUrl(competitor.website)

  return (
    <div className="border rounded-lg p-4 hover:border-primary/50 transition-colors">
      <div className="flex items-start gap-3">
        {faviconUrl ? (
          <img
            src={faviconUrl}
            alt={competitor.competitor_name}
            className="w-10 h-10 rounded-lg object-contain bg-muted flex-shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            <Building2 className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold truncate">{competitor.competitor_name}</h4>
            {competitor.website && (
              <a
                href={competitor.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary flex-shrink-0"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
          {competitor.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {competitor.description}
            </p>
          )}
          {competitor.similarity_reason && (
            <Badge variant="secondary" className="mt-2 text-xs">
              {competitor.similarity_reason}
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}

function InsightsSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <Skeleton className="h-8 w-32" />
      </div>
      <Skeleton className="h-10 w-full max-w-3xl" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
      <Skeleton className="h-64" />
    </div>
  )
}
