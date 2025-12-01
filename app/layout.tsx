import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter, Heebo, Manrope } from "next/font/google"

import { cn } from "@/lib/utils"
import ConditionalLayout from "./conditional-layout"
import RouteGuard from "@/components/routing/RouteGuard"
import { siteConfig } from "@/lib/utils/site-config"

const inter = Inter({ subsets: ["latin"] })
const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  weight: ['400', '700'],
  variable: '--font-heebo',
})
const manrope = Manrope({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  variable: '--font-manrope',
})

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: 'Practice medical exams, track your progress, and master your medical knowledge with Cramler - the comprehensive test preparation platform for medical professionals.',
  keywords: [
    'medical exams',
    'medical test preparation',
    'medical practice questions',
    'medical study platform',
    'medical education',
    'exam preparation',
    'medical training',
    'healthcare education',
    'medical knowledge',
    'study tools'
  ],
  authors: [
    {
      name: "Cramler",
      url: siteConfig.url,
    },
  ],
  creator: "Cramler",
  publisher: "Cramler",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} - Medical exam preparation platform`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: "@cramler",
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: { url: '/apple-touch-icon.png' },
    other: [
      {
        rel: 'android-chrome',
        url: '/android-chrome-192x192.png',
        sizes: '192x192',
      },
      {
        rel: 'android-chrome',
        url: '/android-chrome-512x512.png',
        sizes: '512x512',
      },
    ],
  },
  manifest: "/site.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={cn(inter.className, heebo.variable, manrope.variable)} data-theme="cramler" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className={cn(
        "min-h-screen bg-bg-100 tracking-tight",
        // Mobile viewport adjustments
        "overscroll-contain" // Prevent overscroll on mobile
      )} 
      suppressHydrationWarning>
        <RouteGuard>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </RouteGuard>
      </body>
    </html>
  )
}