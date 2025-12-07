"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/app/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlatformScoreCard } from "@/components/dashboard/platform-score-card"
import { useUserContextValue } from "@/app/providers/UserContextProvider"
import type { Platform } from "@/components/dashboard/platform-icons"
import {
  Package,
  Loader2,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  Tag,
  Users,
  DollarSign,
  Beaker,
  Target,
  RefreshCw,
  Wifi,
  WifiOff,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  FileText,
  History,
  Plus,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useProductWebSocket } from "@/app/hooks/useProductWebSocket"

interface Product {
  id: string
  name: string
  brand_id: string | null
  description: string | null
  image_url: string | null
  ingredients: string[] | null
  claims: string[] | null
  status: string
  created_at: string
  product_type: string | null
  price: string | null
  what_it_does: string | null
  main_category: string | null
  sub_category: string | null
  main_difference: string | null
  target_audience: string | null
  brands?: { id: string; name: string } | null
}

interface VisibilityReport {
  id: string
  report_date: string
  overall_visibility_score: number | null
  visibility_change: number | null
  chatgpt_score: number | null
  chatgpt_mentions: number | null
  claude_score: number | null
  claude_mentions: number | null
  perplexity_score: number | null
  perplexity_mentions: number | null
  gemini_score: number | null
  gemini_mentions: number | null
  copilot_score: number | null
  copilot_mentions: number | null
  total_mentions: number | null
  category_rank: number | null
  sentiment_score: number | null
  positive_attributes: string[] | null
  negative_attributes: string[] | null
  top_triggering_queries: any
}

interface ProductCompetitor {
  id: string
  competitor_name: string
  win_rate: number | null
  comparison_count: number | null
}

export default function ProductDetailPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  const supabase = createClient()
  const { user, currentBrand, isLoading: contextLoading } = useUserContextValue()

  const [product, setProduct] = useState<Product | null>(null)
  const [report, setReport] = useState<VisibilityReport | null>(null)
  const [competitors, setCompetitors] = useState<ProductCompetitor[]>([])
  const [historyReports, setHistoryReports] = useState<VisibilityReport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // WebSocket for real-time updates
  const { status: wsStatus, isConnected } = useProductWebSocket({
    userId: user?.id || null,
    onProductUpdate: useCallback((update) => {
      if (update.productId === productId && user?.id) {
        fetchProduct()
      }
    }, [productId, user?.id])
  })

  const fetchProduct = async () => {
    try {
      // Fetch product with brand info
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select(`
          *,
          brands (id, name)
        `)
        .eq('id', productId)
        .single()

      if (productError) {
        if (productError.code === 'PGRST116') {
          setError('Product not found')
        } else {
          throw productError
        }
        return
      }

      setProduct(productData)

      // Fetch latest visibility report
      const { data: reportData } = await supabase
        .from('product_visibility_reports')
        .select('*')
        .eq('product_id', productId)
        .order('report_date', { ascending: false })
        .limit(1)
        .maybeSingle()

      setReport(reportData)

      // Fetch competitors
      const { data: competitorsData } = await supabase
        .from('product_competitors')
        .select('*')
        .eq('product_id', productId)
        .order('win_rate', { ascending: false })

      setCompetitors(competitorsData || [])

      // Fetch history (last 10 reports)
      const { data: historyData } = await supabase
        .from('product_visibility_reports')
        .select('*')
        .eq('product_id', productId)
        .order('report_date', { ascending: false })
        .limit(10)

      setHistoryReports(historyData || [])

    } catch (err) {
      console.error('Failed to fetch product:', err)
      setError('Failed to load product')
    }
  }

  useEffect(() => {
    const loadData = async () => {
      if (contextLoading) return

      setIsLoading(true)
      await fetchProduct()
      setIsLoading(false)
    }

    loadData()
  }, [productId, contextLoading])

  // Fallback polling for pending products
  useEffect(() => {
    if (!product || product.status !== 'pending' || !user) return
    if (isConnected) return

    const interval = setInterval(fetchProduct, 3000)
    return () => clearInterval(interval)
  }, [product?.status, user, isConnected])

  if (contextLoading || isLoading) {
    return <ProductDetailSkeleton />
  }

  if (error || !product) {
    return (
      <div className="h-full overflow-auto">
        <div className="p-6 max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => router.push('/products')}
            className="mb-6 font-manrope"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Products
          </Button>
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">
                {error || 'Product not found'}
              </h2>
              <p className="text-muted-foreground">
                This product may have been deleted or you don't have access to it.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-yellow-200">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Pending
          </Badge>
        )
      case 'researching':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
            Researching
          </Badge>
        )
      case 'ready':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
            <Sparkles className="w-3 h-3 mr-1" />
            Ready
          </Badge>
        )
      case 'error':
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-700 border-red-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            Error
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const platforms: Platform[] = ["chatgpt", "claude", "perplexity", "gemini", "copilot"]

  return (
    <div className="h-full overflow-auto">
      <div className="p-6 max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/products" className="hover:text-foreground transition-colors">
            Products
          </Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </div>

        {/* Product Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <Package className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold truncate">{product.name}</h1>
                  {getStatusBadge(product.status)}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {product.product_type && (
                    <span className="text-muted-foreground">{product.product_type}</span>
                  )}
                  {product.price && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">{product.price}</span>
                    </>
                  )}
                </div>
              </div>
              <Button variant="outline">Edit</Button>
            </div>
          </CardContent>
        </Card>

        {/* Status Card for Pending/Researching */}
        {(product.status === 'pending' || product.status === 'researching') && (
          <Card className="mb-6 bg-yellow-50 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <RefreshCw className="w-6 h-6 animate-spin text-yellow-600" />
                <div className="flex-1">
                  <h3 className="font-semibold">
                    {product.status === 'pending' ? 'Identifying Product' : 'Researching Product'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Our AI agent is gathering information about this product. This usually takes 10-30 seconds.
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {isConnected ? (
                    <>
                      <Wifi className="w-4 h-4 text-green-500" />
                      <span className="text-xs text-green-600">Live</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Polling</span>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        {product.status === 'ready' && (
          <Tabs defaultValue="visibility" className="space-y-6">
            <TabsList>
              <TabsTrigger value="visibility" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Visibility
              </TabsTrigger>
              <TabsTrigger value="details" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Details
              </TabsTrigger>
              <TabsTrigger value="competitors" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Competitors
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                History
              </TabsTrigger>
            </TabsList>

            {/* Visibility Tab */}
            <TabsContent value="visibility" className="space-y-6">
              {/* Score Card */}
              <Card>
                <CardHeader>
                  <CardTitle>AI Visibility Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <p className="text-5xl font-bold">
                        {report?.overall_visibility_score ?? "—"}
                      </p>
                      <p className="text-sm text-muted-foreground">/100</p>
                    </div>
                    {report?.category_rank && (
                      <div className="text-center">
                        <p className="text-2xl font-semibold">#{report.category_rank}</p>
                        <p className="text-sm text-muted-foreground">in category</p>
                      </div>
                    )}
                    {report?.visibility_change !== null && report?.visibility_change !== undefined && (
                      <div className={cn(
                        "flex items-center gap-2 text-lg",
                        report.visibility_change > 0 ? "text-green-600" : report.visibility_change < 0 ? "text-red-600" : "text-muted-foreground"
                      )}>
                        {report.visibility_change > 0 ? <TrendingUp className="h-5 w-5" /> : report.visibility_change < 0 ? <TrendingDown className="h-5 w-5" /> : <Minus className="h-5 w-5" />}
                        <span>{report.visibility_change > 0 ? "+" : ""}{report.visibility_change}% vs last week</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Platform Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Platform Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {platforms.map((platform) => {
                      const scoreKey = `${platform}_score` as keyof VisibilityReport
                      const score = report?.[scoreKey] as number | null
                      return (
                        <PlatformScoreCard
                          key={platform}
                          platform={platform}
                          score={score}
                        />
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* What AI Says */}
              {(report?.positive_attributes?.length || report?.negative_attributes?.length) && (
                <Card>
                  <CardHeader>
                    <CardTitle>What AI Says About This Product</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-green-600 mb-3">Strengths</h4>
                        <ul className="space-y-2">
                          {(report?.positive_attributes || []).slice(0, 5).map((attr, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <span className="text-green-500 mt-0.5">•</span>
                              {attr}
                            </li>
                          ))}
                          {!report?.positive_attributes?.length && (
                            <li className="text-muted-foreground text-sm italic">No strengths analyzed yet</li>
                          )}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-red-600 mb-3">Weaknesses</h4>
                        <ul className="space-y-2">
                          {(report?.negative_attributes || []).slice(0, 5).map((attr, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <span className="text-red-500 mt-0.5">•</span>
                              {attr}
                            </li>
                          ))}
                          {!report?.negative_attributes?.length && (
                            <li className="text-muted-foreground text-sm italic">No weaknesses analyzed yet</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Top Queries */}
              {report?.top_triggering_queries && (
                <Card>
                  <CardHeader>
                    <CardTitle>Top Queries Triggering Mentions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Array.isArray(report.top_triggering_queries) ? (
                        report.top_triggering_queries.slice(0, 5).map((query: any, i: number) => (
                          <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                            <span className="text-sm">"{query.query || query}"</span>
                            {query.count && (
                              <Badge variant="secondary">{query.count} mentions</Badge>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-sm">No query data available</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {!report && (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center">
                    <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Visibility Data Yet</h3>
                    <p className="text-muted-foreground">
                      Visibility analysis will appear here once we start monitoring this product.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-6">
              {product.description && (
                <Card>
                  <CardHeader>
                    <CardTitle>Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{product.description}</p>
                  </CardContent>
                </Card>
              )}

              {product.what_it_does && (
                <Card>
                  <CardHeader>
                    <CardTitle>What It Does</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{product.what_it_does}</p>
                  </CardContent>
                </Card>
              )}

              {product.main_difference && (
                <Card className="bg-muted/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Key Differentiator
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{product.main_difference}</p>
                  </CardContent>
                </Card>
              )}

              {product.ingredients && product.ingredients.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Beaker className="h-5 w-5" />
                      Ingredients
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {product.ingredients.map((ingredient, index) => (
                        <Badge key={index} variant="secondary">
                          {ingredient}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {product.claims && product.claims.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Product Claims</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {product.claims.map((claim, index) => (
                        <li key={index} className="flex items-start gap-2 text-muted-foreground">
                          <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          {claim}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Metadata */}
              <Card>
                <CardHeader>
                  <CardTitle>Metadata</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-2 gap-4 text-sm">
                    {product.main_category && (
                      <>
                        <dt className="text-muted-foreground">Category</dt>
                        <dd>{product.main_category}</dd>
                      </>
                    )}
                    {product.sub_category && (
                      <>
                        <dt className="text-muted-foreground">Sub-category</dt>
                        <dd>{product.sub_category}</dd>
                      </>
                    )}
                    {product.target_audience && (
                      <>
                        <dt className="text-muted-foreground">Target Audience</dt>
                        <dd>{product.target_audience}</dd>
                      </>
                    )}
                    {product.price && (
                      <>
                        <dt className="text-muted-foreground">Price</dt>
                        <dd>{product.price}</dd>
                      </>
                    )}
                    <dt className="text-muted-foreground">Added</dt>
                    <dd>{new Date(product.created_at).toLocaleDateString()}</dd>
                  </dl>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Competitors Tab */}
            <TabsContent value="competitors" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Product Competitors</h3>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Competitor
                </Button>
              </div>

              {competitors.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Competitors Tracked</h3>
                    <p className="text-muted-foreground mb-4">
                      Add competitors to see head-to-head comparisons.
                    </p>
                    <Button variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add your first competitor
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {competitors.map((competitor) => (
                    <Card key={competitor.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{competitor.competitor_name}</h4>
                            {competitor.comparison_count && (
                              <p className="text-sm text-muted-foreground">
                                AI mentions together: {competitor.comparison_count} times
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            {competitor.win_rate !== null && (
                              <>
                                <p className="text-lg font-semibold">
                                  {competitor.win_rate}%
                                </p>
                                <p className="text-xs text-muted-foreground">win rate</p>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Visibility History</CardTitle>
                  <Button variant="outline" size="sm">Export</Button>
                </CardHeader>
                <CardContent>
                  {historyReports.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No historical data available yet
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-2 font-medium">Date</th>
                            <th className="text-center py-3 px-2 font-medium">Score</th>
                            <th className="text-center py-3 px-2 font-medium">ChatGPT</th>
                            <th className="text-center py-3 px-2 font-medium">Claude</th>
                            <th className="text-center py-3 px-2 font-medium">Perplexity</th>
                            <th className="text-center py-3 px-2 font-medium">Rank</th>
                            <th className="text-center py-3 px-2 font-medium">Change</th>
                          </tr>
                        </thead>
                        <tbody>
                          {historyReports.map((r) => (
                            <tr key={r.id} className="border-b last:border-0">
                              <td className="py-3 px-2">
                                {new Date(r.report_date).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-2 text-center font-semibold">
                                {r.overall_visibility_score ?? "—"}
                              </td>
                              <td className="py-3 px-2 text-center">{r.chatgpt_score ?? "—"}</td>
                              <td className="py-3 px-2 text-center">{r.claude_score ?? "—"}</td>
                              <td className="py-3 px-2 text-center">{r.perplexity_score ?? "—"}</td>
                              <td className="py-3 px-2 text-center">
                                {r.category_rank ? `#${r.category_rank}` : "—"}
                              </td>
                              <td className="py-3 px-2 text-center">
                                {r.visibility_change !== null ? (
                                  <span className={cn(
                                    r.visibility_change > 0 ? "text-green-600" : r.visibility_change < 0 ? "text-red-600" : ""
                                  )}>
                                    {r.visibility_change > 0 ? "+" : ""}{r.visibility_change}
                                  </span>
                                ) : "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Error State */}
        {product.status === 'error' && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <div>
                  <h3 className="font-semibold">Research Failed</h3>
                  <p className="text-sm text-muted-foreground">
                    We couldn't research this product. Please try again or enter more details.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function ProductDetailSkeleton() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-32" />
      <Skeleton className="h-10 w-96" />
      <Skeleton className="h-48" />
      <Skeleton className="h-64" />
    </div>
  )
}
