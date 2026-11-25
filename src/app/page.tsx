"use client"

import { useState, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Brain, Target, Zap, Shield, CheckCircle, RotateCcw, Sparkles, ArrowRight, ChevronDown, Filter, BarChart2, Clock, DollarSign, TrendingUp, TrendingDown, Calendar, Maximize2, Minimize2, AlertCircle, Info, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { interventionDatabase } from "@/lib/utils"
import { Navigation } from "@/components/Navigation"
import { AssessmentForm } from "@/components/AssessmentForm"
import { ResultsDashboard } from "@/components/ResultsDashboard"
import { HeroBackground } from "@/components/HeroBackground"
import { cn } from "@/lib/utils"

export default function HomePage() {
  const [userData, setUserData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [currentInterventions, setCurrentInterventions] = useState(interventionDatabase.map(i => ({ ...i, adherence: 0.7 })))
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleAssessmentComplete = useCallback(async (data: any) => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1800))
    setUserData(data)
    setShowResults(true)
    setIsLoading(false)
    document.getElementById("results")?.scrollIntoView({ behavior: "smooth" })
  }, [])

  const handleInterventionChange = useCallback((interventions: any[]) => {
    setCurrentInterventions(interventions)
  }, [])

  const handleReset = useCallback(() => {
    setUserData(null)
    setShowResults(false)
    setCurrentInterventions(interventionDatabase.map(i => ({ ...i, adherence: 0.7 })))
    document.getElementById("assessment")?.scrollIntoView({ behavior: "smooth" })
  }, [])

  return (
    <div className="relative min-h-screen bg-void">
      <HeroBackground />
      
      <Navigation scrollY={scrollY} />
      
      <main className="relative z-10 pt-20">
        {!showResults && (
          <>
            <HeroSection />
            <MethodologySection />
            <AssessmentForm onComplete={handleAssessmentComplete} isLoading={isLoading} />
          </>
        )}

        {showResults && userData && (
          <>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="sticky top-20 z-190 bg-void/95 backdrop-blur-[40px] border-b border-seam px-6 py-4"
            >
              <div className="container mx-auto max-w-[1440px] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-xl bg-emerald-500/10">
                    <CheckCircle className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-ink">Assessment Complete</p>
                    <p className="text-sm text-ink-muted">
                      Generated {interventionDatabase.length} evidence-based interventions for {userData.chronologicalAge || 40}yo {userData.sex}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-seam text-sm font-medium text-ink-muted hover:bg-surface hover:text-ink hover:border-seam-strong transition-all duration-200"
                >
                  <RotateCcw className="h-4 w-4" />
                  New Assessment
                </button>
              </div>
            </motion.div>

            <ResultsDashboard 
              userData={userData} 
              onInterventionChange={handleInterventionChange}
            />
          </>
        )}
      </main>
    </div>
  )
}

function HeroSection() {
  return (
    <section id="hero" className="relative min-h-[100vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-void to-void" />
      
      <div className="relative container mx-auto px-6 py-20">
        <div className="max-w-6xl mx-auto text-center">
          <motion.span 
            className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-5 py-2 text-label font-mono text-emerald-400"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <Sparkles className="h-4 w-4" />
            <span>BUILD 2036 — Health, Longevity & Biotechnology</span>
          </motion.span>

          <motion.h1 
            className="mt-8 text-display font-display font-bold tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          >
            Your Personalized
            <br />
            <span className="gradient-emerald">Longevity Engine</span>
          </motion.h1>

          <motion.p 
            className="mt-8 text-lede max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          >
            AI-powered intervention ranking using causal inference, multi-omic aging clocks, and your unique biology. 
            See exactly which changes add the most healthy years to your life.
          </motion.p>

          <motion.div 
            className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.45 }}
          >
            <a
              href="#assessment"
              className="relative inline-flex h-16 px-10 rounded-xl bg-emerald-500 text-void text-lg font-medium hover:bg-emerald-400 transition-all duration-200 active:scale-[0.98] items-center justify-center gap-3 overflow-hidden group"
            >
              <Target className="h-6 w-6" />
              Start Free Assessment
              <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="#methodology"
              className="relative inline-flex h-16 px-10 rounded-xl border border-seam bg-transparent text-ink text-lg font-medium hover:bg-surface hover:border-seam-strong hover:text-emerald-400 transition-all duration-200 active:scale-[0.98] items-center justify-center gap-3"
            >
              <Shield className="h-6 w-6" />
              View Methodology
            </a>
          </motion.div>

          <motion.div 
            className="mt-18 flex flex-wrap items-center justify-center gap-10 text-sm text-ink-muted"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
          >
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-400" />
              <span>Evidence-Graded</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-cyan-400" />
              <span>Causal ML</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-amber-400" />
              <span>Personalized</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-rose-400" />
              <span>Real-Time Simulation</span>
            </div>
          </motion.div>

          <motion.div 
            className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.7 }}
          >
            <StatCard value="12" label="Interventions" color="emerald" icon={<Sparkles />} />
            <StatCard value="6" label="Categories" color="cyan" icon={<BarChart2 />} />
            <StatCard value="5" label="Aging Clocks" color="amber" icon={<Clock />} />
            <StatCard value="∞" label="What-If Scenarios" color="rose" icon={<Zap />} />
          </motion.div>

          <motion.div 
            className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.5 }}
          >
            <div className="w-px h-16 bg-gradient-to-b from-emerald-500/0 via-emerald-500/30 to-emerald-500/0" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function StatCard({ value, label, color, icon }: { value: string; label: string; color: string; icon: React.ReactNode }) {
  const colorMap: Record<string, string> = {
    emerald: "text-emerald-400",
    cyan: "text-cyan-400",
    amber: "text-amber-400",
    rose: "text-rose-400",
  }
  
  return (
    <div className="text-center group relative">
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-void to-void" />
      <div className="relative flex h-14 w-14 mx-auto mb-4 items-center justify-center rounded-xl bg-gradient-to-br"
        style={{ backgroundColor: colorMap[color]?.replace("text-", "bg-").replace("-400", "-500/15") || "bg-emerald-500/15" }}
      >
        <span className={cn("text-2xl", colorMap[color])}>{icon}</span>
        <div className="absolute -bottom-2 -right-2 h-3 w-3 rounded-full animate-ping" style={{ backgroundColor: colorMap[color]?.replace("text-", "bg-") }} />
      </div>
      <div className="font-display font-bold text-4xl md:text-5xl" style={{ color: colorMap[color]?.replace("text-", "") }}>{value}</div>
      <div className="mt-2 text-label text-ink-muted">{label}</div>
    </div>
  )
}

function MethodologySection() {
  const steps = [
    { number: "01", title: "Comprehensive Assessment", description: "80+ biomarkers across blood work, hormones, organ function, fitness, epigenetics, and lifestyle.", icon: Brain },
    { number: "02", title: "Causal ML Engine", description: "Counterfactual reasoning estimates each intervention's true effect on your biological age trajectory.", icon: Target },
    { number: "03", title: "Evidence-Graded Ranking", description: "Interventions scored by RCT quality, mechanism plausibility, and personalized relevance.", icon: Shield },
    { number: "04", title: "Real-Time Simulation", description: "Interactive what-if scenarios show how adherence changes alter your 20-year aging trajectory.", icon: Zap },
  ]

  return (
    <section id="methodology" className="relative py-24 md:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-void to-void" />
      <div className="relative container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.span 
            className="text-label text-emerald-400"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            How It Works
          </motion.span>
          <motion.h2 
            className="mt-5 text-title font-display font-bold tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            From Data to <span className="gradient-emerald">Longevity Protocol</span>
          </motion.h2>
          <motion.p 
            className="mt-5 text-lede"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          >
            Our AI engine combines causal inference, multi-omic aging clocks, and evidence-graded interventions 
            to generate your personalized longevity protocol.
          </motion.p>
        </div>

        <div className="grid gap-8 md:grid-cols-4">
          {steps.map((step, index) => (
            <motion.article
              key={step.number}
              className="group relative p-8 rounded-2xl glass-layer transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_32px_64px_-16px_rgb(0_0_0_/_0.3)]"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: index * 0.1 }}
            >
              <div className="absolute -top-4 -right-4 text-8xl font-display font-bold text-emerald-500/3" aria-hidden="true">
                {step.number}
              </div>
              <div className="relative flex h-16 w-16 items-center justify-center rounded-xl bg-emerald-500/10 mb-5 group-hover:bg-emerald-500/20 transition-all duration-300">
                <step.icon className="h-8 w-8 text-emerald-400" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-3">{step.title}</h3>
              <p className="text-sm text-ink-muted leading-relaxed">{step.description}</p>
              <div className="mt-6 flex items-center gap-2 text-label text-emerald-400 group-hover:gap-4 transition-all duration-300">
                <span>Explore</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}