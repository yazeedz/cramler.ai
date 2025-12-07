"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/app/utils/supabase/client"
import {
  Building2,
  Store,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  Globe,
  FileText,
  Tags,
  Users,
  Plus,
  X,
  Sparkles,
  Wifi,
} from "lucide-react"
import { cn } from "@/lib/utils"

type Step = "organization" | "brand" | "description" | "topics" | "competitors" | "complete"

interface Competitor {
  id: string
  name: string
  website: string
  logo_url?: string
  description?: string
  similarity_reason?: string
}

interface SuggestedCompetitor {
  name: string
  website: string | null
  description: string
  similarity_reason: string
  strengths: string[]
  target_audience: string | null
}

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<Step>("organization")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Organization form state
  const [orgName, setOrgName] = useState("")
  const [orgSlug, setOrgSlug] = useState("")
  const [createdOrgId, setCreatedOrgId] = useState<string | null>(null)

  // Brand form state
  const [brandName, setBrandName] = useState("")
  const [brandWebsite, setBrandWebsite] = useState("")
  const [createdBrandId, setCreatedBrandId] = useState<string | null>(null)

  // Description state
  const [brandDescription, setBrandDescription] = useState("")

  // Topics state
  const [topics, setTopics] = useState<string[]>([])
  const [newTopic, setNewTopic] = useState("")

  // Competitors state
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [newCompetitorName, setNewCompetitorName] = useState("")
  const [newCompetitorWebsite, setNewCompetitorWebsite] = useState("")
  const [isResearchingCompetitors, setIsResearchingCompetitors] = useState(false)
  const [suggestedCompetitors, setSuggestedCompetitors] = useState<SuggestedCompetitor[]>([])
  const [competitorResearchTriggered, setCompetitorResearchTriggered] = useState(false)

  // WebSocket state for brand research
  const wsRef = useRef<WebSocket | null>(null)
  const [wsConnected, setWsConnected] = useState(false)
  const [isResearchingBrand, setIsResearchingBrand] = useState(false)
  const [suggestedTopics, setSuggestedTopics] = useState<string[]>([])
  const [userId, setUserId] = useState<string | null>(null)

  const WS_URL = process.env.NEXT_PUBLIC_WS_SERVER_URL || 'ws://localhost:3001'

  // Get user ID on mount
  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
      }
    }
    getUser()
  }, [supabase.auth])

  // WebSocket connection
  const connectWebSocket = useCallback(() => {
    if (!userId) return
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    try {
      const ws = new WebSocket(WS_URL)
      wsRef.current = ws

      ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'AUTH', userId }))
      }

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          console.log('WebSocket message:', message)

          switch (message.type) {
            case 'AUTH_SUCCESS':
              setWsConnected(true)
              break

            case 'BRAND_RESEARCH_STARTED':
              setIsResearchingBrand(true)
              break

            case 'BRAND_RESEARCH_COMPLETE':
              setIsResearchingBrand(false)
              if (message.data) {
                // Auto-fill description
                if (message.data.description) {
                  setBrandDescription(message.data.description)
                }
                // Store suggested topics for later
                if (message.data.suggested_topics && message.data.suggested_topics.length > 0) {
                  setSuggestedTopics(message.data.suggested_topics)
                }
              }
              break

            case 'BRAND_RESEARCH_ERROR':
              setIsResearchingBrand(false)
              console.error('Brand research error:', message.error)
              break

            case 'COMPETITOR_RESEARCH_STARTED':
              setIsResearchingCompetitors(true)
              break

            case 'COMPETITOR_RESEARCH_COMPLETE':
              setIsResearchingCompetitors(false)
              if (message.data?.competitors && message.data.competitors.length > 0) {
                setSuggestedCompetitors(message.data.competitors)
              }
              break

            case 'COMPETITOR_RESEARCH_ERROR':
              setIsResearchingCompetitors(false)
              console.error('Competitor research error:', message.error)
              break
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err)
        }
      }

      ws.onclose = () => {
        setWsConnected(false)
        wsRef.current = null
      }

      ws.onerror = () => {
        if (wsRef.current?.readyState !== WebSocket.OPEN) {
          setWsConnected(false)
        }
      }
    } catch (err) {
      console.error('Failed to create WebSocket:', err)
    }
  }, [userId, WS_URL])

  // Connect WebSocket when userId is available
  useEffect(() => {
    if (userId) {
      connectWebSocket()
    }
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [userId, connectWebSocket])

  // Trigger brand research
  const researchBrand = useCallback((websiteUrl: string, name?: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected')
      return false
    }

    const requestId = crypto.randomUUID()
    wsRef.current.send(JSON.stringify({
      type: 'RESEARCH_BRAND',
      requestId,
      websiteUrl,
      brandName: name
    }))

    return true
  }, [])

  // Trigger competitor research
  const researchCompetitors = useCallback(() => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected')
      return false
    }

    if (!brandDescription || topics.length === 0) {
      console.error('Brand description and topics required for competitor research')
      return false
    }

    const requestId = crypto.randomUUID()
    wsRef.current.send(JSON.stringify({
      type: 'RESEARCH_COMPETITORS',
      requestId,
      brandName: brandName,
      brandDescription: brandDescription,
      industry: suggestedTopics[0] || topics[0] || 'General',
      topics: topics
    }))

    return true
  }, [brandName, brandDescription, topics, suggestedTopics])

  const steps: Step[] = ["organization", "brand", "description", "topics", "competitors", "complete"]
  const currentStepIndex = steps.indexOf(step)

  // Trigger competitor research when entering competitors step
  useEffect(() => {
    if (step === 'competitors' && !competitorResearchTriggered && wsConnected && brandDescription && topics.length > 0) {
      setCompetitorResearchTriggered(true)
      researchCompetitors()
    }
  }, [step, competitorResearchTriggered, wsConnected, brandDescription, topics, researchCompetitors])

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleOrgNameChange = (value: string) => {
    setOrgName(value)
    if (!orgSlug || orgSlug === generateSlug(orgName)) {
      setOrgSlug(generateSlug(value))
    }
  }

  // Topic management
  const addTopic = () => {
    const trimmed = newTopic.trim()
    if (trimmed && !topics.includes(trimmed)) {
      setTopics([...topics, trimmed])
      setNewTopic("")
    }
  }

  const removeTopic = (topicToRemove: string) => {
    setTopics(topics.filter(t => t !== topicToRemove))
  }

  // Competitor management
  const addCompetitor = () => {
    const name = newCompetitorName.trim()
    if (name && competitors.length < 20) {
      const newComp: Competitor = {
        id: crypto.randomUUID(),
        name,
        website: newCompetitorWebsite.trim(),
        logo_url: newCompetitorWebsite.trim()
          ? `https://www.google.com/s2/favicons?domain=${newCompetitorWebsite.trim()}&sz=64`
          : undefined
      }
      setCompetitors([...competitors, newComp])
      setNewCompetitorName("")
      setNewCompetitorWebsite("")
    }
  }

  const removeCompetitor = (id: string) => {
    setCompetitors(competitors.filter(c => c.id !== id))
  }

  const createOrganization = async () => {
    if (!orgName.trim() || !orgSlug.trim()) {
      setError("Organization name and slug are required")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError("You must be logged in")
        return
      }

      // Create organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: orgName.trim(),
          slug: orgSlug.trim(),
        })
        .select()
        .single()

      if (orgError) {
        if (orgError.code === '23505') {
          setError("An organization with this slug already exists")
        } else {
          setError(orgError.message)
        }
        return
      }

      // Add user as admin member
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: org.id,
          user_id: user.id,
          role: 'admin',
        })

      if (memberError) {
        setError(memberError.message)
        return
      }

      setCreatedOrgId(org.id)
      setStep("brand")
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const createBrand = async () => {
    if (!brandName.trim()) {
      setError("Brand name is required")
      return
    }

    if (!createdOrgId) {
      setError("Organization not found")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Create brand
      const { data: brand, error: brandError } = await supabase
        .from('brands')
        .insert({
          name: brandName.trim(),
          website: brandWebsite.trim() || null,
          organization_id: createdOrgId,
        })
        .select()
        .single()

      if (brandError) {
        setError(brandError.message)
        return
      }

      setCreatedBrandId(brand.id)

      // Trigger brand research if website is provided
      if (brandWebsite.trim() && wsConnected) {
        researchBrand(brandWebsite.trim(), brandName.trim())
      }

      setStep("description")
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const saveDescription = async () => {
    if (!brandDescription.trim()) {
      setError("Please describe what your brand does")
      return
    }

    if (!createdBrandId) {
      setError("Brand not found")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { error: updateError } = await supabase
        .from('brands')
        .update({ description: brandDescription.trim() })
        .eq('id', createdBrandId)

      if (updateError) {
        setError(updateError.message)
        return
      }

      setStep("topics")
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const saveTopics = async () => {
    if (topics.length < 2) {
      setError("Please add at least 2 topics")
      return
    }

    if (!createdBrandId) {
      setError("Brand not found")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { error: updateError } = await supabase
        .from('brands')
        .update({ topics })
        .eq('id', createdBrandId)

      if (updateError) {
        setError(updateError.message)
        return
      }

      setStep("competitors")
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const saveCompetitorsAndComplete = async () => {
    if (!createdBrandId || !createdOrgId) {
      setError("Brand or organization not found")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError("You must be logged in")
        return
      }

      // Save competitors if any
      if (competitors.length > 0) {
        const competitorData = competitors.map(c => ({
          brand_id: createdBrandId,
          competitor_name: c.name,
          website: c.website || null,
          description: c.description || null,
          similarity_reason: c.similarity_reason || null,
        }))

        const { error: compError } = await supabase
          .from('brand_competitors')
          .insert(competitorData)

        if (compError) {
          console.error('Failed to save competitors:', compError)
          // Don't block completion if competitors fail
        }
      }

      // Update membership with current_brand_id
      await supabase
        .from('organization_members')
        .update({ current_brand_id: createdBrandId })
        .eq('organization_id', createdOrgId)
        .eq('user_id', user.id)

      setStep("complete")

      // Redirect after a brief moment
      setTimeout(() => {
        router.push('/overview')
        router.refresh()
      }, 1500)
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const goBack = () => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setStep(steps[prevIndex])
      setError(null)
    }
  }

  // Progress indicator component
  const ProgressIndicator = () => {
    const stepIcons = [
      { step: "organization", icon: Building2, label: "Organization" },
      { step: "brand", icon: Store, label: "Brand" },
      { step: "description", icon: FileText, label: "Description" },
      { step: "topics", icon: Tags, label: "Topics" },
      { step: "competitors", icon: Users, label: "Competitors" },
    ]

    return (
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center gap-1">
          {stepIcons.map((s, i) => {
            const Icon = s.icon
            const isComplete = currentStepIndex > i || step === "complete"
            const isCurrent = step === s.step

            return (
              <div key={s.step} className="flex items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                    isComplete ? "bg-primary text-primary-foreground" :
                    isCurrent ? "bg-primary text-primary-foreground" :
                    "bg-muted text-muted-foreground"
                  )}
                >
                  {isComplete && !isCurrent ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                {i < stepIcons.length - 1 && (
                  <div className={cn(
                    "w-8 h-1 mx-1",
                    currentStepIndex > i ? "bg-primary" : "bg-muted"
                  )} />
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <ProgressIndicator />

        {/* Organization Step */}
        {step === "organization" && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Create Your Organization</CardTitle>
              <CardDescription>
                An organization is your workspace. You can invite team members and manage multiple brands.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="orgName">Organization Name</Label>
                <Input
                  id="orgName"
                  placeholder="Acme Inc."
                  value={orgName}
                  onChange={(e) => handleOrgNameChange(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="orgSlug">URL Slug</Label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">/</span>
                  <Input
                    id="orgSlug"
                    placeholder="acme-inc"
                    value={orgSlug}
                    onChange={(e) => setOrgSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    disabled={isLoading}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  This will be used in URLs and cannot be changed easily
                </p>
              </div>

              <Button
                className="w-full"
                onClick={createOrganization}
                disabled={isLoading || !orgName.trim() || !orgSlug.trim()}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4 mr-2" />
                )}
                Continue
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Brand Step */}
        {step === "brand" && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Create Your Brand</CardTitle>
              <CardDescription>
                A brand represents a product line or company you want to monitor for AI visibility.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="brandName">Brand Name</Label>
                <Input
                  id="brandName"
                  placeholder="My Awesome Brand"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="brandWebsite">Brand Website</Label>
                  {wsConnected && (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <Wifi className="h-3 w-3" />
                      AI ready
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="brandWebsite"
                    placeholder="www.example.com"
                    value={brandWebsite}
                    onChange={(e) => setBrandWebsite(e.target.value)}
                    disabled={isLoading}
                    className="pl-10"
                  />
                </div>
                {brandWebsite.trim() && wsConnected && (
                  <p className="text-xs text-blue-600 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    AI will analyze your website to help fill in brand details
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={goBack}
                  disabled={isLoading}
                  className="flex-1"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={createBrand}
                  disabled={isLoading || !brandName.trim()}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4 mr-2" />
                  )}
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Description Step */}
        {step === "description" && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Describe Your Brand</CardTitle>
              <CardDescription>
                Tell us what your brand does and what makes it unique. This helps us understand your market.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
                  {error}
                </div>
              )}

              {/* AI Research Status */}
              {isResearchingBrand && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Sparkles className="h-5 w-5 text-blue-600" />
                      <Loader2 className="h-5 w-5 text-blue-600 animate-spin absolute inset-0" />
                    </div>
                    <div>
                      <p className="font-medium text-blue-900">AI is researching your brand...</p>
                      <p className="text-sm text-blue-700">
                        Analyzing your website to understand your brand and suggest a description.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="brandDescription">What does your brand do?</Label>
                  {brandDescription && !isResearchingBrand && brandWebsite && (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      AI-generated
                    </span>
                  )}
                </div>
                <Textarea
                  id="brandDescription"
                  placeholder={isResearchingBrand
                    ? "AI is generating a description..."
                    : "Describe your brand, its products or services, target audience, and what makes it stand out..."}
                  value={brandDescription}
                  onChange={(e) => setBrandDescription(e.target.value)}
                  disabled={isLoading || isResearchingBrand}
                  rows={6}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  {isResearchingBrand
                    ? "Please wait while AI researches your brand..."
                    : "Be specific - this helps us find relevant AI conversations about your brand. Feel free to edit the AI-generated text."}
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={goBack}
                  disabled={isLoading || isResearchingBrand}
                  className="flex-1"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={saveDescription}
                  disabled={isLoading || isResearchingBrand || !brandDescription.trim()}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4 mr-2" />
                  )}
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Topics Step */}
        {step === "topics" && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Select Your Topics</CardTitle>
              <CardDescription>
                Add topics that describe what your brand does. These help us find relevant AI conversations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
                  {error}
                </div>
              )}

              {/* AI Suggested Topics */}
              {suggestedTopics.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                    <Label className="text-blue-600">AI Suggested Topics</Label>
                  </div>
                  <div className="flex flex-wrap gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    {suggestedTopics
                      .filter(st => !topics.includes(st))
                      .map((topic) => (
                        <button
                          key={topic}
                          onClick={() => {
                            if (!topics.includes(topic)) {
                              setTopics([...topics, topic])
                            }
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-blue-200 rounded-full text-sm hover:bg-blue-100 transition-colors"
                          disabled={isLoading}
                        >
                          <Plus className="h-3 w-3" />
                          <span>{topic}</span>
                        </button>
                      ))}
                    {suggestedTopics.filter(st => !topics.includes(st)).length === 0 && (
                      <p className="text-sm text-blue-600">All suggestions added!</p>
                    )}
                  </div>
                </div>
              )}

              {/* Add new topic */}
              <div className="flex gap-2">
                <Input
                  placeholder="Enter a topic..."
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTopic()
                    }
                  }}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={addTopic}
                  disabled={isLoading || !newTopic.trim()}
                  size="icon"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Topics display */}
              <div className="min-h-[120px] p-4 border rounded-lg bg-muted/30">
                {topics.length === 0 ? (
                  <p className="text-muted-foreground text-center text-sm">
                    No topics added yet. Add at least 2 topics.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {topics.map((topic) => (
                      <div
                        key={topic}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-background border rounded-full text-sm"
                      >
                        <span>{topic}</span>
                        <button
                          onClick={() => removeTopic(topic)}
                          className="text-muted-foreground hover:text-foreground"
                          disabled={isLoading}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <p className="text-xs text-muted-foreground text-center">
                {topics.length} / 2 minimum topics added
              </p>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={goBack}
                  disabled={isLoading}
                  className="flex-1"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={saveTopics}
                  disabled={isLoading || topics.length < 2}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4 mr-2" />
                  )}
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Competitors Step */}
        {step === "competitors" && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Add Your Competitors</CardTitle>
              <CardDescription>
                Track up to 20 competitors to monitor your relative AI visibility
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
                  {error}
                </div>
              )}

              {/* AI Research Status */}
              {isResearchingCompetitors && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Sparkles className="h-5 w-5 text-blue-600" />
                      <Loader2 className="h-5 w-5 text-blue-600 animate-spin absolute inset-0" />
                    </div>
                    <div>
                      <p className="font-medium text-blue-900">AI is finding competitors...</p>
                      <p className="text-sm text-blue-700">
                        Searching for companies in your industry based on your topics.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Suggested Competitors */}
              {suggestedCompetitors.length > 0 && !isResearchingCompetitors && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                    <Label className="text-blue-600">AI Suggested Competitors</Label>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2 max-h-[300px] overflow-y-auto">
                    {suggestedCompetitors
                      .filter(sc => !competitors.some(c => c.name.toLowerCase() === sc.name.toLowerCase()))
                      .map((suggested) => (
                        <div
                          key={suggested.name}
                          className="flex items-start gap-3 p-3 bg-white border border-blue-100 rounded-lg"
                        >
                          {suggested.website ? (
                            <img
                              src={`https://www.google.com/s2/favicons?domain=${suggested.website}&sz=64`}
                              alt={suggested.name}
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
                            <p className="font-medium text-sm">{suggested.name}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2">{suggested.description}</p>
                            <p className="text-xs text-blue-600 mt-1">{suggested.similarity_reason}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (competitors.length < 20) {
                                const newComp: Competitor = {
                                  id: crypto.randomUUID(),
                                  name: suggested.name,
                                  website: suggested.website || '',
                                  logo_url: suggested.website
                                    ? `https://www.google.com/s2/favicons?domain=${suggested.website}&sz=64`
                                    : undefined,
                                  description: suggested.description,
                                  similarity_reason: suggested.similarity_reason
                                }
                                setCompetitors([...competitors, newComp])
                              }
                            }}
                            disabled={isLoading || competitors.length >= 20}
                            className="flex-shrink-0"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                        </div>
                      ))}
                    {suggestedCompetitors.filter(sc => !competitors.some(c => c.name.toLowerCase() === sc.name.toLowerCase())).length === 0 && (
                      <p className="text-sm text-blue-600 text-center py-2">All suggestions added!</p>
                    )}
                  </div>
                </div>
              )}

              {/* Add new competitor header */}
              <div className="flex items-center justify-between">
                <Label>Add Manually</Label>
                <span className="text-sm text-muted-foreground">{competitors.length}/20</span>
              </div>

              {/* Add competitor form */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Competitor name"
                    value={newCompetitorName}
                    onChange={(e) => setNewCompetitorName(e.target.value)}
                    disabled={isLoading || competitors.length >= 20}
                    className="pl-10"
                  />
                </div>
                <div className="relative flex-1">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="www.example.com (optional)"
                    value={newCompetitorWebsite}
                    onChange={(e) => setNewCompetitorWebsite(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addCompetitor()
                      }
                    }}
                    disabled={isLoading || competitors.length >= 20}
                    className="pl-10"
                  />
                </div>
                <Button
                  onClick={addCompetitor}
                  disabled={isLoading || !newCompetitorName.trim() || competitors.length >= 20}
                  size="icon"
                  className="shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Competitors grid */}
              <div className="min-h-[200px] max-h-[400px] overflow-y-auto">
                {competitors.length === 0 ? (
                  <div className="flex items-center justify-center h-[200px] border rounded-lg bg-muted/30">
                    <p className="text-muted-foreground text-sm">
                      No competitors added yet. You can skip this step if you prefer.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {competitors.map((competitor) => (
                      <div
                        key={competitor.id}
                        className="relative flex items-center gap-3 p-3 border rounded-lg bg-background"
                      >
                        {competitor.logo_url ? (
                          <img
                            src={competitor.logo_url}
                            alt={competitor.name}
                            className="w-10 h-10 rounded-lg object-contain bg-muted"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none'
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{competitor.name}</p>
                          {competitor.website && (
                            <p className="text-xs text-muted-foreground truncate">{competitor.website}</p>
                          )}
                        </div>
                        <button
                          onClick={() => removeCompetitor(competitor.id)}
                          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
                          disabled={isLoading}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={goBack}
                  disabled={isLoading || isResearchingCompetitors}
                  className="flex-1"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={saveCompetitorsAndComplete}
                  disabled={isLoading || isResearchingCompetitors}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : isResearchingCompetitors ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  {isResearchingCompetitors ? "Finding competitors..." : competitors.length > 0 ? "Complete Setup" : "Skip & Complete"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Complete Step */}
        {step === "complete" && (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">You're all set!</h2>
              <p className="text-muted-foreground mb-4">
                Your organization and brand have been created. Redirecting you to the dashboard...
              </p>
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
