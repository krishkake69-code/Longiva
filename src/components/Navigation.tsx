"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Brain, Target, Zap, Shield, ChevronDown, Menu, X } from "lucide-react"
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink, NavigationMenuIndicator } from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"

interface NavigationProps {
  scrollY: number
}

export function Navigation({ scrollY }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { label: "Assessment", href: "#assessment" },
    { label: "Interventions", href: "#interventions" },
    { label: "Biomarkers", href: "#biomarkers" },
    { label: "Simulation", href: "#simulation" },
    { label: "Evidence", href: "#evidence" },
  ]

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-200 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
      scrollY > 20
        ? "bg-void/90 backdrop-blur-[40px] border-b border-seam shadow-[0_4px_24px_-4px_rgb(0_0_0_/_0.3)]"
        : "bg-transparent"
    )}>
      <nav className="container mx-auto px-6" aria-label="Main navigation">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-2" aria-label="Longiva Home">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/15">
              <Brain className="h-6 w-6 text-emerald-400" aria-hidden="true" />
              <span className="absolute -bottom-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" aria-hidden="true" />
            </div>
            <span className="text-xl font-display font-bold tracking-tight">Longiva</span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            <NavigationMenu>
              <NavigationMenuList>
                {navItems.map((item) => (
                  <NavigationMenuItem key={item.label}>
                    <NavigationMenuTrigger className="text-sm font-medium text-ink-muted hover:text-ink hover:bg-surface/50 transition-colors">
                      {item.label}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="rounded-xl border border-seam bg-void-elevated/95 backdrop-blur-[40px] p-2 shadow-[0_32px_64px_-16px_rgb(0_0_0_/_0.4)]">
                      <NavigationMenuLink 
                        href={item.href}
                        className="flex h-11 items-center px-4 rounded-lg text-sm font-medium text-ink-muted hover:text-emerald-400 hover:bg-surface transition-colors"
                      >
                        {item.label}
                      </NavigationMenuLink>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
              <NavigationMenuIndicator className="h-0.5 bg-emerald-500/30" />
            </NavigationMenu>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="#methodology"
              className="hidden lg:inline-flex h-10 px-4 rounded-lg text-sm font-medium text-ink-muted hover:text-emerald-400 hover:bg-surface transition-all duration-200 items-center justify-center"
            >
              Methodology
            </Link>
            <Link
              href="#assessment"
              className="inline-flex h-10 px-6 rounded-xl bg-emerald-500 text-void text-sm font-medium hover:bg-emerald-400 transition-all duration-200 items-center justify-center gap-2 shadow-[0_4px_16px_-4px_rgb(0_217_126_/_0.4)]"
            >
              <Target className="h-4 w-4" />
              Start Assessment
            </Link>
            <button
              className="lg:hidden p-2 rounded-lg text-ink-muted hover:text-ink hover:bg-surface transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div id="mobile-menu" className="lg:hidden py-4 border-t border-seam animate-slide-down">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="px-4 py-3 rounded-xl text-base font-medium text-ink-muted hover:text-emerald-400 hover:bg-surface transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="#methodology"
                className="px-4 py-3 rounded-xl text-base font-medium text-ink-muted hover:text-emerald-400 hover:bg-surface transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Methodology
              </Link>
            </nav>
          </div>
        )}
      </nav>
    </header>
  )
}