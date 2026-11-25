import type { Metadata, Viewport } from "next"
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"], 
  variable: "--font-space-grotesk",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap"
})

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap"
})

const jetbrains = JetBrains_Mono({ 
  subsets: ["latin"], 
  variable: "--font-jetbrains-mono",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap"
})

export const metadata: Metadata = {
  title: "Longiva — Personalized Longevity Engine",
  description: "AI-powered intervention ranking using causal inference, multi-omic aging clocks, and your unique biology. See exactly which changes add the most healthy years to your life.",
  keywords: ["longevity", "biological age", "health optimization", "aging clocks", "personalized medicine", "life extension", "geroscience", "healthspan"],
  authors: [{ name: "Longiva Team" }],
  creator: "Longiva",
  publisher: "Longiva",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://longiva.app",
    title: "Longiva — Personalized Longevity Engine",
    description: "AI-powered intervention ranking using causal inference, aging clocks, and your unique biology.",
    siteName: "Longiva",
  },
  twitter: {
    card: "summary_large_image",
    title: "Longiva — Personalized Longevity Engine",
    description: "AI-powered intervention ranking using causal inference, aging clocks, and your unique biology.",
  },
}

export const viewport: Viewport = {
  themeColor: "#0d1117",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrains.variable} antialiased`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-void font-sans text-ink">
        {children}
      </body>
    </html>
  )
}