"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatCard } from "@/components/dashboard/stat-card"
import { PlatformIcon, Platform, getPlatformName } from "@/components/dashboard/platform-icons"
import { useUserContextValue } from "@/app/providers/UserContextProvider"
import { createClient } from "@/app/utils/supabase/client"
import {
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  Lightbulb,
  Users,
  MessageSquare,
  CheckCircle2,
  XCircle,
  PlayCircle,
  ExternalLink,
  Building2,
  Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

interface Recommendation {
  id: string
  title: string
  description: string
  priority: "high" | "medium" | "low"
  expected_impact: string | null
  effort_level: string | null
  status: "pending" | "in_progress" | "completed" | "dismissed"
  recommendation_type: string
  product_id: string | null
  created_at: string
  products?: { id: string; name: string } | null
}

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

const priorityColors = {
  high: "bg-red-100 text-red-800 border-red-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  low: "bg-blue-100 text-blue-800 border-blue-200",
}

const priorityDotColors = {
  high: "bg-red-500",
  medium: "bg-yellow-500",
  low: "bg-blue-500",
}

export default function InsightsPage() {
  const { currentBrand, isLoading: contextLoading } = useUserContextValue()
  const [isLoading, setIsLoading] = useState(true)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [responses, setResponses] = useState<VisibilityQuery[]>([])

  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      if (!currentBrand) return

      setIsLoading(true)
      try {
        const [recsRes, compsRes, responsesRes] = await Promise.all([
          // Recommendations
          supabase
            .from("visibility_recommendations")
            .select(`
              *,
              products (id, name)
            `)
            .eq("brand_id", currentBrand.id)
            .order("priority")
            .order("created_at", { ascending: false }),

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
            .eq("product_mentioned", true)
            .order("queried_at", { ascending: false })
            .limit(20),
        ])

        setRecommendations(recsRes.data || [])
        setCompetitors(compsRes.data || [])
        setResponses(responsesRes.data || [])
      } catch (error) {
        console.error("Failed to fetch insights data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [currentBrand, supabase])

  async function updateRecommendationStatus(id: string, status: string) {
    const { error } = await supabase
      .from("visibility_recommendations")
      .update({ status, completed_at: status === "completed" ? new Date().toISOString() : null })
      .eq("id", id)

    if (!error) {
      setRecommendations(prev =>
        prev.map(r => r.id === id ? { ...r, status: status as Recommendation["status"] } : r)
      )
    }
  }

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

  // Summary counts
  const summary = {
    high: recommendations.filter(r => r.priority === "high" && r.status === "pending").length,
    medium: recommendations.filter(r => r.priority === "medium" && r.status === "pending").length,
    completed: recommendations.filter(r => r.status === "completed").length,
  }

  const pendingRecs = recommendations.filter(r => r.status === "pending" || r.status === "in_progress")
  const highPriorityRecs = pendingRecs.filter(r => r.priority === "high")
  const mediumPriorityRecs = pendingRecs.filter(r => r.priority === "medium")
  const lowPriorityRecs = pendingRecs.filter(r => r.priority === "low")

  return (
    <div className="p-6 space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold font-manrope">Insights</h1>
      </div>

      <Tabs defaultValue="recommendations" className="space-y-6">
        <TabsList>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Recommendations
            {summary.high > 0 && (
              <Badge variant="destructive" className="ml-1">{summary.high}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="competitors" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Competitors
          </TabsTrigger>
          <TabsTrigger value="responses" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Sample Responses
          </TabsTrigger>
        </TabsList>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-red-200 bg-red-50/50">
              <CardContent className="pt-6">
                <p className="text-sm text-red-600 font-medium">High Priority</p>
                <p className="text-3xl font-bold text-red-700">{summary.high}</p>
                <p className="text-sm text-red-600/70">needs action</p>
              </CardContent>
            </Card>
            <Card className="border-yellow-200 bg-yellow-50/50">
              <CardContent className="pt-6">
                <p className="text-sm text-yellow-600 font-medium">Medium Priority</p>
                <p className="text-3xl font-bold text-yellow-700">{summary.medium}</p>
                <p className="text-sm text-yellow-600/70">can improve</p>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="pt-6">
                <p className="text-sm text-green-600 font-medium">Completed</p>
                <p className="text-3xl font-bold text-green-700">{summary.completed}</p>
                <p className="text-sm text-green-600/70">this month</p>
              </CardContent>
            </Card>
          </div>

          {pendingRecs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                <p className="text-muted-foreground">No pending recommendations at this time.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* High Priority */}
              {highPriorityRecs.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-red-600">
                    High Priority
                  </h3>
                  <div className="space-y-3">
                    {highPriorityRecs.map((rec) => (
                      <RecommendationCard
                        key={rec.id}
                        recommendation={rec}
                        onStart={() => updateRecommendationStatus(rec.id, "in_progress")}
                        onDismiss={() => updateRecommendationStatus(rec.id, "dismissed")}
                        onComplete={() => updateRecommendationStatus(rec.id, "completed")}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Medium Priority */}
              {mediumPriorityRecs.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-yellow-600">
                    Medium Priority
                  </h3>
                  <div className="space-y-3">
                    {mediumPriorityRecs.map((rec) => (
                      <RecommendationCard
                        key={rec.id}
                        recommendation={rec}
                        onStart={() => updateRecommendationStatus(rec.id, "in_progress")}
                        onDismiss={() => updateRecommendationStatus(rec.id, "dismissed")}
                        onComplete={() => updateRecommendationStatus(rec.id, "completed")}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Low Priority */}
              {lowPriorityRecs.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                    Low Priority
                  </h3>
                  <div className="space-y-3">
                    {lowPriorityRecs.map((rec) => (
                      <RecommendationCard
                        key={rec.id}
                        recommendation={rec}
                        onStart={() => updateRecommendationStatus(rec.id, "in_progress")}
                        onDismiss={() => updateRecommendationStatus(rec.id, "dismissed")}
                        onComplete={() => updateRecommendationStatus(rec.id, "completed")}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* Competitors Tab */}
        <TabsContent value="competitors" className="space-y-6">
          {/* Tracked Competitors */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Tracked Competitors</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Companies you're monitoring in AI responses
                </p>
              </div>
              <Badge variant="secondary">{competitors.length} competitors</Badge>
            </CardHeader>
            <CardContent>
              {competitors.length === 0 ? (
                <div className="py-8 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No competitors tracked yet</h3>
                  <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                    Competitors are automatically added during onboarding. You can also add them manually.
                  </p>
                </div>
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

        {/* Sample Responses Tab */}
        <TabsContent value="responses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent AI Responses Mentioning Your Brand</CardTitle>
            </CardHeader>
            <CardContent>
              {responses.length === 0 ? (
                <div className="py-8 text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No AI responses recorded yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {responses.map((response) => (
                    <AIResponseCard key={response.id} response={response} />
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

function RecommendationCard({
  recommendation,
  onStart,
  onDismiss,
  onComplete,
}: {
  recommendation: Recommendation
  onStart: () => void
  onDismiss: () => void
  onComplete: () => void
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <div className={cn(
            "w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0",
            priorityDotColors[recommendation.priority]
          )} />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold">{recommendation.title}</h3>
                {recommendation.products && (
                  <p className="text-sm text-muted-foreground">{recommendation.products.name}</p>
                )}
              </div>
              {recommendation.status === "in_progress" && (
                <Badge variant="secondary">In Progress</Badge>
              )}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{recommendation.description}</p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
              {recommendation.expected_impact && (
                <span>Impact: <span className="font-medium">{recommendation.expected_impact}</span></span>
              )}
              {recommendation.effort_level && (
                <span>Effort: <span className="font-medium capitalize">{recommendation.effort_level}</span></span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="gap-2 pt-0">
        {recommendation.status === "pending" ? (
          <Button size="sm" onClick={onStart}>
            <PlayCircle className="h-4 w-4 mr-1" />
            Start
          </Button>
        ) : (
          <Button size="sm" onClick={onComplete}>
            <CheckCircle2 className="h-4 w-4 mr-1" />
            Complete
          </Button>
        )}
        <Button size="sm" variant="outline" onClick={onDismiss}>
          <XCircle className="h-4 w-4 mr-1" />
          Dismiss
        </Button>
      </CardFooter>
    </Card>
  )
}

function CompetitorCard({ competitor }: { competitor: Competitor }) {
  // Extract domain for favicon
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

function AIResponseCard({ response }: { response: VisibilityQuery }) {
  const platform = response.ai_platform.toLowerCase() as Platform
  const sentimentColors = {
    positive: "text-green-600",
    neutral: "text-muted-foreground",
    negative: "text-red-600",
  }

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <PlatformIcon platform={platform} className="w-5 h-5" />
          <span className="font-medium">{getPlatformName(platform)}</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(response.queried_at), { addSuffix: true })}
        </span>
      </div>
      <p className="text-sm text-muted-foreground mb-2">
        Query: "{response.query_text}"
      </p>
      {response.response_text && (
        <p className="text-sm bg-muted p-3 rounded mb-3">
          "{response.response_text.slice(0, 300)}{response.response_text.length > 300 ? "..." : ""}"
        </p>
      )}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        {response.mention_position && (
          <span>Position: #{response.mention_position}</span>
        )}
        {response.sentiment && (
          <span className={sentimentColors[response.sentiment as keyof typeof sentimentColors] || ""}>
            Sentiment: {response.sentiment}
          </span>
        )}
        {response.products && (
          <span>Product: {response.products.name}</span>
        )}
      </div>
    </div>
  )
}

function InsightsSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-10 w-96" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
      <Skeleton className="h-64" />
    </div>
  )
}
