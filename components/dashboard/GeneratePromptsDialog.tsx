"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Loader2, Sparkles, CheckCircle2, XCircle, Wifi, WifiOff } from 'lucide-react'

type GenerationStatus = 'idle' | 'generating' | 'completed' | 'error'

type Brand = {
  id: string
  name: string
  description?: string
  suggested_topics?: string[]
  organization_id: string
}

type Competitor = {
  name: string
}

type GeneratePromptsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  brand: Brand | null
  competitors?: Competitor[]
  userId: string | null
  onComplete?: (totalTopics: number, totalPrompts: number) => void
}

export function GeneratePromptsDialog({
  open,
  onOpenChange,
  brand,
  competitors = [],
  userId,
  onComplete
}: GeneratePromptsDialogProps) {
  const [status, setStatus] = useState<GenerationStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [numTopics, setNumTopics] = useState(5)
  const [promptsPerTopic, setPromptsPerTopic] = useState(5)
  const [useFastMode, setUseFastMode] = useState(true)
  const [result, setResult] = useState<{ totalTopics: number; totalPrompts: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  // WebSocket state
  const wsRef = useRef<WebSocket | null>(null)
  const [wsConnected, setWsConnected] = useState(false)

  // Use refs for values that need to be accessed in WebSocket callbacks
  // This prevents stale closure issues
  const currentRequestIdRef = useRef<string | null>(null)
  const onCompleteRef = useRef(onComplete)

  // Keep refs up to date
  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  const WS_URL = process.env.NEXT_PUBLIC_WS_SERVER_URL || 'ws://localhost:3001'

  // WebSocket connection
  const connectWebSocket = useCallback(() => {
    if (!userId) return
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    try {
      const ws = new WebSocket(WS_URL)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('[GeneratePromptsDialog] WebSocket opened, sending AUTH')
        ws.send(JSON.stringify({ type: 'AUTH', userId }))
      }

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          console.log('[GeneratePromptsDialog] WebSocket message:', message)
          console.log('[GeneratePromptsDialog] Current requestId ref:', currentRequestIdRef.current)

          switch (message.type) {
            case 'AUTH_SUCCESS':
              console.log('[GeneratePromptsDialog] AUTH_SUCCESS received')
              setWsConnected(true)
              break

            case 'PROMPT_GENERATION_STARTED':
              // Use ref to get current requestId value
              if (message.requestId === currentRequestIdRef.current) {
                console.log('[GeneratePromptsDialog] PROMPT_GENERATION_STARTED - matching requestId')
                setStatus('generating')
                setProgress(10)
              }
              break

            case 'PROMPT_GENERATION_COMPLETE':
              // Use ref to get current requestId value
              if (message.requestId === currentRequestIdRef.current) {
                console.log('[GeneratePromptsDialog] PROMPT_GENERATION_COMPLETE - matching requestId')
                setStatus('completed')
                setProgress(100)
                setResult({
                  totalTopics: message.totalTopics || 0,
                  totalPrompts: message.totalPrompts || 0
                })
                onCompleteRef.current?.(message.totalTopics || 0, message.totalPrompts || 0)
              }
              break

            case 'PROMPT_GENERATION_ERROR':
              // Use ref to get current requestId value
              if (message.requestId === currentRequestIdRef.current) {
                console.log('[GeneratePromptsDialog] PROMPT_GENERATION_ERROR - matching requestId')
                setStatus('error')
                setError(message.error || 'An error occurred during prompt generation')
              }
              break
          }
        } catch (err) {
          console.error('[GeneratePromptsDialog] Failed to parse WebSocket message:', err)
        }
      }

      ws.onclose = () => {
        console.log('[GeneratePromptsDialog] WebSocket closed')
        setWsConnected(false)
        wsRef.current = null
      }

      ws.onerror = (err) => {
        console.error('[GeneratePromptsDialog] WebSocket error:', err)
        if (wsRef.current?.readyState !== WebSocket.OPEN) {
          setWsConnected(false)
        }
      }
    } catch (err) {
      console.error('[GeneratePromptsDialog] Failed to create WebSocket:', err)
    }
  }, [userId, WS_URL])

  // Connect WebSocket when dialog opens and userId is available
  useEffect(() => {
    if (open && userId) {
      connectWebSocket()
    }
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [open, userId, connectWebSocket])

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setStatus('idle')
      setProgress(0)
      setResult(null)
      setError(null)
      currentRequestIdRef.current = null
    }
  }, [open])

  // Simulate progress while generating
  useEffect(() => {
    if (status === 'generating' && progress < 90) {
      const timer = setInterval(() => {
        setProgress(prev => Math.min(prev + Math.random() * 5, 90))
      }, 2000)
      return () => clearInterval(timer)
    }
  }, [status, progress])

  const handleGenerate = () => {
    if (!brand || !userId) return

    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('[GeneratePromptsDialog] WebSocket not connected, trying to reconnect...')
      connectWebSocket()
      setError('Connection not ready. Please try again.')
      return
    }

    const requestId = crypto.randomUUID()
    // Set ref immediately so WebSocket handler can access it
    currentRequestIdRef.current = requestId
    console.log('[GeneratePromptsDialog] Set currentRequestIdRef to:', requestId)

    setStatus('generating')
    setProgress(5)
    setError(null)

    wsRef.current.send(JSON.stringify({
      type: 'GENERATE_PROMPTS',
      requestId,
      brandId: brand.id,
      brandName: brand.name,
      brandDescription: brand.description || '',
      topics: brand.suggested_topics || [],
      competitors: competitors.map(c => c.name),
      organizationId: brand.organization_id,
      numTopics,
      promptsPerTopic,
      useFastMode
    }))

    console.log('[GeneratePromptsDialog] Sent GENERATE_PROMPTS request:', requestId)
  }

  const handleClose = () => {
    if (status === 'generating') {
      return
    }
    onOpenChange(false)
  }

  const totalPromptsToGenerate = numTopics * promptsPerTopic

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Generate Research Prompts
            </DialogTitle>
            {/* WebSocket Connection Status */}
            <div
              className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs cursor-pointer ${
                wsConnected
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
              }`}
              onClick={() => !wsConnected && userId && connectWebSocket()}
              title={!userId ? 'No user ID - please sign in' : wsConnected ? 'Connected' : 'Click to connect'}
            >
              {wsConnected ? (
                <>
                  <Wifi className="h-3 w-3" />
                  <span>Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3" />
                  <span>{userId ? 'Connecting...' : 'No User'}</span>
                </>
              )}
            </div>
          </div>
          <DialogDescription>
            {brand ? (
              <>Generate AI visibility research prompts for <strong>{brand.name}</strong></>
            ) : (
              'Select a brand to generate prompts'
            )}
          </DialogDescription>
        </DialogHeader>

        {status === 'idle' && (
          <div className="space-y-6 py-4">
            {/* Number of Topics */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Number of Topics</Label>
                <span className="text-sm font-medium text-muted-foreground">{numTopics}</span>
              </div>
              <Slider
                value={[numTopics]}
                onValueChange={(value) => setNumTopics(value[0])}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Topics like "Anti-aging skincare", "Moisturizers", etc.
              </p>
            </div>

            {/* Prompts per Topic */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Prompts per Topic</Label>
                <span className="text-sm font-medium text-muted-foreground">{promptsPerTopic}</span>
              </div>
              <Slider
                value={[promptsPerTopic]}
                onValueChange={(value) => setPromptsPerTopic(value[0])}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Consumer questions like "What's the best X for Y?"
              </p>
            </div>

            {/* Fast Mode Toggle */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="fast-mode">Fast Mode</Label>
                <p className="text-xs text-muted-foreground">
                  Use optimized generation (recommended)
                </p>
              </div>
              <Switch
                id="fast-mode"
                checked={useFastMode}
                onCheckedChange={setUseFastMode}
              />
            </div>

            {/* Summary */}
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm">
                This will generate <strong>{totalPromptsToGenerate} prompts</strong> across{' '}
                <strong>{numTopics} topics</strong> for tracking {brand?.name}'s visibility in AI assistants like ChatGPT, Claude, and Perplexity.
              </p>
            </div>
          </div>
        )}

        {status === 'generating' && (
          <div className="space-y-6 py-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
                <Sparkles className="absolute -right-1 -top-1 h-5 w-5 text-yellow-500 animate-pulse" />
              </div>
              <div className="text-center space-y-2">
                <p className="font-medium">Generating prompts...</p>
                <p className="text-sm text-muted-foreground">
                  AI is analyzing your brand and creating research prompts
                </p>
              </div>
            </div>
            <Progress value={progress} className="w-full" />
            <p className="text-center text-xs text-muted-foreground">
              This may take a minute or two
            </p>
          </div>
        )}

        {status === 'completed' && result && (
          <div className="space-y-6 py-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
                <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-center space-y-2">
                <p className="font-medium text-lg">Prompts Generated!</p>
                <p className="text-sm text-muted-foreground">
                  Successfully created {result.totalPrompts} prompts across {result.totalTopics} topics
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border p-4 text-center">
                <p className="text-2xl font-bold text-purple-600">{result.totalTopics}</p>
                <p className="text-sm text-muted-foreground">Topics</p>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <p className="text-2xl font-bold text-purple-600">{result.totalPrompts}</p>
                <p className="text-sm text-muted-foreground">Prompts</p>
              </div>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6 py-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="rounded-full bg-red-100 p-3 dark:bg-red-900">
                <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
              </div>
              <div className="text-center space-y-2">
                <p className="font-medium text-lg">Generation Failed</p>
                <p className="text-sm text-muted-foreground">
                  {error || 'An unexpected error occurred'}
                </p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          {status === 'idle' && (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={!brand || !wsConnected}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Generate {totalPromptsToGenerate} Prompts
              </Button>
            </>
          )}

          {status === 'generating' && (
            <Button variant="outline" disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </Button>
          )}

          {status === 'completed' && (
            <Button onClick={() => onOpenChange(false)}>
              Done
            </Button>
          )}

          {status === 'error' && (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button onClick={handleGenerate}>
                Try Again
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
