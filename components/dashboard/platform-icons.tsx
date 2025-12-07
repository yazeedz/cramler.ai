"use client"

import { cn } from "@/lib/utils"

// Platform icons as simple SVG components
export function ChatGPTIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("w-6 h-6", className)} fill="currentColor">
      <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08-4.778 2.758a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/>
    </svg>
  )
}

export function ClaudeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("w-6 h-6", className)} fill="currentColor">
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
    </svg>
  )
}

export function PerplexityIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("w-6 h-6", className)} fill="currentColor">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
    </svg>
  )
}

export function GeminiIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("w-6 h-6", className)} fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
  )
}

export function CopilotIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("w-6 h-6", className)} fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-4h2v2h-2v-2zm0-2h2V7h-2v7z"/>
    </svg>
  )
}

export type Platform = "chatgpt" | "claude" | "perplexity" | "gemini" | "copilot"

const platformConfig: Record<Platform, { name: string; Icon: React.FC<{ className?: string }>; color: string }> = {
  chatgpt: { name: "ChatGPT", Icon: ChatGPTIcon, color: "text-emerald-600" },
  claude: { name: "Claude", Icon: ClaudeIcon, color: "text-orange-500" },
  perplexity: { name: "Perplexity", Icon: PerplexityIcon, color: "text-blue-600" },
  gemini: { name: "Gemini", Icon: GeminiIcon, color: "text-purple-600" },
  copilot: { name: "Copilot", Icon: CopilotIcon, color: "text-cyan-600" },
}

export function PlatformIcon({ platform, className }: { platform: Platform; className?: string }) {
  const config = platformConfig[platform]
  const { Icon } = config
  return <Icon className={cn(config.color, className)} />
}

export function getPlatformName(platform: Platform): string {
  return platformConfig[platform].name
}

export function getPlatformColor(platform: Platform): string {
  return platformConfig[platform].color
}
