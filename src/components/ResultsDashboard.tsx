"use client"

import { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, Cell, PieChart, Pie
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"
import { Tooltip as TooltipComp, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import { cn, getCategoryColor } from "@/lib/utils"
import { 
  Target, TrendingUp, TrendingDown, Zap, Shield, Brain, Heart, Dumbbell, Pill, Moon, Salad, Activity,
  ChevronDown, ChevronUp, CheckCircle, AlertCircle, Info, Calendar, Clock, DollarSign, FlaskConical,
  Dumbbell as DumbbellIcon, Bed, Utensils, Sparkles, Filter, X, Maximize2, Minimize2, RotateCcw, BarChart2,
  ArrowRight, ChevronLeft, ChevronRight
} from "lucide-react"
import { interventionDatabase, Intervention, calculateBiologicalAge, CATEGORY_CONFIG, EVIDENCE_CONFIG, COST_CONFIG, STUDY_TYPE_CONFIG } from "@/lib/utils"

interface UserProfile {
  chronologicalAge?: number
  [key: string]: unknown
}

interface ResultsDashboardProps {
  userData: UserProfile
  onInterventionChange: (interventions: Intervention[]) => void
}

const CATEGORY_ICONS: Record<Intervention["category"], React.ComponentType<{ className?: string }>> = {
  supplement: Pill,
  exercise: DumbbellIcon,
  diet: Salad,
  sleep: Bed,
  drug: FlaskConical,
  behavioral: Brain,
}

export function ResultsDashboard({ userData, onInterventionChange }: ResultsDashboardProps) {
  const [interventions, setInterventions] = useState<Intervention[]>(
    interventionDatabase.map(i => ({ ...i, adherence: 0.7 }))
  )
  const [activeTab, setActiveTab] = useState("overview")
  const [filterCategory, setFilterCategory] = useState<Intervention["category"] | "all">("all")
  const [sortBy, setSortBy] = useState<"impact" | "confidence" | "cost" | "adherence">("impact")
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())
  const [showDetails, setShowDetails] = useState(false)
  const [timeHorizon, setTimeHorizon] = useState(10)
  const [adherenceScenario, setAdherenceScenario] = useState<"current" | "optimistic" | "pessimistic">("current")

  const biologicalAge = useMemo(() => calculateBiologicalAge(userData.chronologicalAge || 40, interventions), [userData.chronologicalAge, interventions])
  const ageGap = useMemo(() => (userData.chronologicalAge || 40) - biologicalAge, [userData.chronologicalAge, biologicalAge])
  const totalImpact = useMemo(() => interventions.reduce((sum, i) => sum + i.effectSize * i.adherence, 0), [interventions])
  const avgConfidence = useMemo(() => interventions.reduce((sum, i) => sum + i.confidence, 0) / interventions.length, [interventions])
  const activeCount = interventions.filter(i => i.adherence > 0).length
  const monthlyCost = interventions.filter(i => i.adherence > 0).reduce((sum, i) => sum + COST_CONFIG[i.cost].value, 0)

  const filteredInterventions = useMemo(() => {
    let result = [...interventions]
    if (filterCategory !== "all") result = result.filter(i => i.category === filterCategory)
    result.sort((a, b) => {
      if (sortBy === "impact") return (b.effectSize * b.adherence) - (a.effectSize * a.adherence)
      if (sortBy === "confidence") return b.confidence - a.confidence
      if (sortBy === "cost") return COST_CONFIG[a.cost].value - COST_CONFIG[b.cost].value
      if (sortBy === "adherence") return b.adherence - a.adherence
      return 0
    })
    return result
  }, [interventions, filterCategory, sortBy])

  const handleAdherenceChange = (id: string, value: number) => {
    const updated = interventions.map(i => i.id === id ? { ...i, adherence: value } : i)
    setInterventions(updated)
    onInterventionChange(updated)
  }

  const handleToggleExpanded = (id: string) => {
    setExpandedCards(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const agingTrajectory = useMemo(() => {
    const currentAge = userData.chronologicalAge || 40
    const currentBioAge = biologicalAge
    const years = Array.from({ length: 20 }, (_, i) => currentAge + i)
    return years.map((y, i) => ({
      age: y,
      noIntervention: currentBioAge + i * 1.0,
      withIntervention: currentBioAge + i * Math.max(0.3, 1.0 - totalImpact / 20),
      optimistic: currentBioAge + i * Math.max(0.2, 1.0 - interventions.reduce((sum, i) => sum + i.effectSize, 0) / 20),
    }))
  }, [userData.chronologicalAge, biologicalAge, totalImpact, interventions])

  const biomarkerImpact = useMemo(() => [
    { name: "Inflammation", current: 75, projected: Math.max(20, 75 - totalImpact * 15), color: "rose" },
    { name: "Metabolic", current: 65, projected: Math.max(15, 65 - totalImpact * 12), color: "amber" },
    { name: "Cardiovascular", current: 70, projected: Math.max(20, 70 - totalImpact * 10), color: "cyan" },
    { name: "Hormonal", current: 60, projected: Math.max(20, 60 - totalImpact * 8), color: "emerald" },
    { name: "Organ Function", current: 80, projected: Math.max(25, 80 - totalImpact * 5), color: "cyan" },
  ], [totalImpact])

  const projection = useMemo(() => {
    const currentAge = userData.chronologicalAge || 40
    const activeInterventions = interventions.filter(i => i.adherence > 0)
    const scenarioMultiplier = { current: 1, optimistic: 1.3, pessimistic: 0.5 }[adherenceScenario]
    const totalEffectSize = activeInterventions.reduce((sum, i) => sum + i.effectSize * i.adherence, 0) * scenarioMultiplier
    const annualAgingRate = Math.max(0.3, 1.0 - totalEffectSize / 20)
    
    return Array.from({ length: timeHorizon + 1 }, (_, i) => {
      const age = currentAge + i
      const bioAge = biologicalAge + i * annualAgingRate
      const gap = age - bioAge
      return { age, bioAge: Math.max(bioAge, age * 0.65), gap: Math.max(0, gap) }
    })
  }, [timeHorizon, adherenceScenario, interventions, biologicalAge, userData.chronologicalAge])

  const lifeExpectancyGain = projection[timeHorizon]?.gap || 0

  const categoryStats = useMemo(() => {
    const stats: Record<string, { count: number; active: number; totalImpact: number }> = {}
    interventions.forEach(i => {
      if (!stats[i.category]) stats[i.category] = { count: 0, active: 0, totalImpact: 0 }
      stats[i.category].count++
      if (i.adherence > 0) {
        stats[i.category].active++
        stats[i.category].totalImpact += i.effectSize * i.adherence
      }
    })
    return stats
  }, [interventions])

  return (
    <TooltipProvider>
      <div id="results" className="relative space-y-10 pb-20">
        {/* Biological Age Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500/8 via-void to-cyan-500/5 p-8 md:p-12 border border-seam/50"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-from)_0%,transparent_60%)] from-emerald-500/10" aria-hidden="true" />
          <div className="relative grid gap-10 lg:grid-cols-3">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2 text-label font-mono text-emerald-400 mb-5">
                <Zap className="h-4 w-4" aria-hidden="true" />
                <span>Your Biological Age</span>
              </div>
              <div className="flex items-baseline justify-center lg:justify-start gap-5">
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 1, type: "spring", stiffness: 100 }}
                  className="text-7xl md:text-9xl font-display font-bold gradient-emerald"
                >
                  {biologicalAge.toFixed(1)}
                </motion.span>
                <div className="text-sm text-ink-muted">
                  <p>Chronological: <span className="font-medium text-ink">{userData.chronologicalAge || 40}</span> years</p>
                  <p className={cn("font-medium", ageGap > 0 ? "text-emerald-400" : "text-rose-400")}>
                    {ageGap > 0 ? "+" : ""}{ageGap.toFixed(1)} years younger
                  </p>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-2">
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={agingTrajectory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorNoIntervention" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorWithIntervention" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00d97e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00d97e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorOptimistic" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" strokeOpacity={0.15} stroke="#334155" />
                  <XAxis dataKey="age" tick={{ fill: "currentColor", fontSize: 12, fontFamily: "JetBrains Mono" }} />
                  <YAxis tick={{ fill: "currentColor", fontSize: 12, fontFamily: "JetBrains Mono" }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "oklch(0.11 0.02 260)", border: "1px solid #334155", borderRadius: "12px", boxShadow: "0 24px 48px -12px rgb(0 0 0 / 0.5)" }}
                    labelFormatter={(v) => `Age ${v}`}
                    formatter={(v: any) => v !== undefined ? [`${v.toFixed(1)} years`, "Biological Age"] : ["", "Biological Age"]}
                  />
                  <Area type="monotone" dataKey="noIntervention" stroke="#f43f5e" fillOpacity={1} fill="url(#colorNoIntervention)" strokeWidth={2.5} />
                  <Area type="monotone" dataKey="withIntervention" stroke="#00d97e" fillOpacity={1} fill="url(#colorWithIntervention)" strokeWidth={2.5} />
                  <Area type="monotone" dataKey="optimistic" stroke="#06b6d4" fillOpacity={1} fill="url(#colorOptimistic)" strokeWidth={2.5} strokeDasharray="6 6" />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mt-6 text-sm">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-rose-500" /><span className="text-ink-muted">No Change</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500" /><span className="text-ink-muted">Your Plan</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full border-2 border-dashed border-cyan-500" /><span className="text-ink-muted">Full Adherence</span></div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard title="Total Potential" value={`${totalImpact.toFixed(1)} yrs`} description="Biological age reduction" icon={Target} trend={true} trendValue={`${(totalImpact / (userData.chronologicalAge || 40) * 100).toFixed(0)}%`} />
          <MetricCard title="Avg Confidence" value={`${(avgConfidence * 100).toFixed(0)}%`} description="Evidence-weighted" icon={Shield} />
          <MetricCard title="Active Interventions" value={activeCount.toString()} description={`of ${interventions.length} available`} icon={CheckCircle} />
          <MetricCard title="Monthly Cost" value={`$${monthlyCost}`} description="Estimated out-of-pocket" icon={DollarSign} />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-5 bg-surface/50 rounded-xl p-1.5 border border-seam/50">
            <TabsTrigger value="overview" className="data-[state=active]:bg-emerald-500/15 data-[state=active]:text-emerald-400 data-[state=active]:border-emerald-500/30">Overview</TabsTrigger>
            <TabsTrigger value="interventions" className="data-[state=active]:bg-emerald-500/15 data-[state=active]:text-emerald-400 data-[state=active]:border-emerald-500/30">Interventions</TabsTrigger>
            <TabsTrigger value="biomarkers" className="data-[state=active]:bg-emerald-500/15 data-[state=active]:text-emerald-400 data-[state=active]:border-emerald-500/30">Biomarkers</TabsTrigger>
            <TabsTrigger value="simulation" className="data-[state=active]:bg-emerald-500/15 data-[state=active]:text-emerald-400 data-[state=active]:border-emerald-500/30">Simulation</TabsTrigger>
            <TabsTrigger value="evidence" className="data-[state=active]:bg-emerald-500/15 data-[state=active]:text-emerald-400 data-[state=active]:border-emerald-500/30">Evidence</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <div className="grid gap-8 lg:grid-cols-2">
              <Card className="glass-layer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Aging Rate Projection</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={agingTrajectory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="4 4" strokeOpacity={0.15} stroke="#334155" />
                      <XAxis dataKey="age" tick={{ fill: "currentColor", fontSize: 12, fontFamily: "JetBrains Mono" }} />
                      <YAxis tick={{ fill: "currentColor", fontSize: 12, fontFamily: "JetBrains Mono" }} />
                      <Tooltip labelFormatter={(v) => `Age ${v}`} formatter={(v: any, name: any) => v !== undefined ? [`${v.toFixed(2)}`, name] : ["", name]} />
                      <Line type="monotone" dataKey="noIntervention" stroke="#f43f5e" strokeWidth={2.5} dot={false} name="No Change" />
                      <Line type="monotone" dataKey="withIntervention" stroke="#00d97e" strokeWidth={2.5} dot={false} name="Your Plan" />
                      <Line type="monotone" dataKey="optimistic" stroke="#06b6d4" strokeWidth={2.5} strokeDasharray="6 6" dot={false} name="Full Adherence" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="glass-layer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Biomarker Impact Projection</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={biomarkerImpact} layout="vertical" margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="4 4" strokeOpacity={0.15} stroke="#334155" vertical={false} />
                      <XAxis type="number" tick={{ fill: "currentColor", fontSize: 12, fontFamily: "JetBrains Mono" }} />
                      <YAxis dataKey="name" type="category" tick={{ fill: "currentColor", fontSize: 12, fontFamily: "JetBrains Mono" }} width={110} />
                      <Tooltip formatter={(v: any) => v !== undefined ? [`${v}th percentile`, "Risk"] : ["", "Risk"]} />
                      <Bar dataKey="current" fill="#f43f5e" radius={[0, 6, 6, 0]} name="Current Risk" />
                      <Bar dataKey="projected" fill="#00d97e" radius={[0, 6, 6, 0]} name="Projected Risk" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="glass-layer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5" /> Intervention Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie
                        data={Object.entries(categoryStats).map(([name, stat]) => ({ name, value: stat.active }))}
                        cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={3}
                        dataKey="value" nameKey="name"
                        label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                      >
                        {Object.entries(categoryStats).map((_, index) => (
                          <Cell key={index} fill={getCategoryColor(Object.keys(categoryStats)[index] as Intervention["category"])} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: any) => v !== undefined ? [`${v} interventions`, "Active"] : ["", "Active"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="glass-layer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5" /> Cost vs Impact Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart
                      data={interventions.filter(i => i.adherence > 0).map(i => ({
                        name: i.name,
                        cost: COST_CONFIG[i.cost].value,
                        impact: i.effectSize * i.adherence,
                        confidence: i.confidence,
                      })).sort((a, b) => a.cost - b.cost)}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="4 4" strokeOpacity={0.15} stroke="#334155" />
                      <XAxis dataKey="cost" type="number" tick={{ fill: "currentColor", fontSize: 12, fontFamily: "JetBrains Mono" }} name="Monthly Cost ($)" />
                      <YAxis tick={{ fill: "currentColor", fontSize: 12, fontFamily: "JetBrains Mono" }} name="Impact (years)" />
                      <Tooltip formatter={(v: any, name: any) => v !== undefined ? [name === "impact" ? `${v.toFixed(2)} yrs` : `$${v}`, name] : ["", name]} />
                      <Line type="monotone" dataKey="impact" stroke="#00d97e" strokeWidth={3.5} dot={false} name="Impact" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="interventions" className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Filter className="h-5 w-5 text-ink-muted" />
                <Select value={filterCategory} onValueChange={setFilterCategory as any}>
                  <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Categories" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="supplement">Supplements</SelectItem>
                    <SelectItem value="exercise">Exercise</SelectItem>
                    <SelectItem value="diet">Diet</SelectItem>
                    <SelectItem value="sleep">Sleep</SelectItem>
                    <SelectItem value="drug">Drugs</SelectItem>
                    <SelectItem value="behavioral">Behavioral</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy as any}>
                  <SelectTrigger className="w-[160px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="impact">Impact (High → Low)</SelectItem>
                    <SelectItem value="confidence">Confidence</SelectItem>
                    <SelectItem value="cost">Cost (Low → High)</SelectItem>
                    <SelectItem value="adherence">Adherence</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              {filteredInterventions.map((intervention, index) => (
                <InterventionCard
                  key={intervention.id}
                  intervention={intervention}
                  index={index}
                  isExpanded={expandedCards.has(intervention.id)}
                  onToggleExpand={handleToggleExpanded}
                  onAdherenceChange={handleAdherenceChange}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="biomarkers" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {biomarkerImpact.map((marker) => (
              <BiomarkerCard key={marker.name} marker={marker} />
            ))}
          </TabsContent>

          <TabsContent value="simulation" className="space-y-8">
            <SimulationPanel 
              interventions={interventions} 
              userData={userData}
              biologicalAge={biologicalAge}
              timeHorizon={timeHorizon}
              setTimeHorizon={setTimeHorizon}
              adherenceScenario={adherenceScenario}
              setAdherenceScenario={setAdherenceScenario}
              showDetails={showDetails}
              setShowDetails={setShowDetails}
              projection={projection}
              lifeExpectancyGain={lifeExpectancyGain}
            />
          </TabsContent>

          <TabsContent value="evidence" className="space-y-6">
            <EvidenceTimeline interventions={interventions} />
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  )
}

function MetricCard({ title, value, description, icon: Icon, trend, trendValue }: {
  title: string, value: string, description: string, icon: React.ComponentType<{ className?: string }>, trend?: boolean, trendValue?: string
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl border border-seam bg-surface/50 p-6 transition-all duration-300 hover:border-seam-strong hover:shadow-[0_24px_48px_-12px_rgb(0_0_0_/_0.3)] glass-layer"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-ink-muted">{title}</p>
          <p className="text-4xl font-display font-bold mt-2">{value}</p>
          <p className="text-sm text-ink-muted mt-2">{description}</p>
          {trend && trendValue && (
            <div className="flex items-center gap-1 mt-3 text-sm text-emerald-400">
              <TrendingUp className="h-4 w-4" />
              <span>+{trendValue} vs baseline</span>
            </div>
          )}
        </div>
        <div className="p-4 rounded-xl bg-emerald-500/10"><Icon className="h-7 w-7 text-emerald-400" /></div>
      </div>
    </motion.div>
  )
}

function InterventionCard({ 
  intervention, 
  index, 
  isExpanded, 
  onToggleExpand, 
  onAdherenceChange 
}: { 
  intervention: Intervention, index: number, isExpanded: boolean, 
  onToggleExpand: (id: string) => void, onAdherenceChange: (id: string, value: number) => void
}) {
  const CategoryIcon = CATEGORY_ICONS[intervention.category]
  const catConfig = CATEGORY_CONFIG[intervention.category]
  const evConfig = EVIDENCE_CONFIG[intervention.evidenceLevel]
  const impact = intervention.effectSize * intervention.adherence
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="group relative overflow-hidden rounded-2xl border border-seam bg-surface/50 transition-all duration-300 hover:border-seam-strong hover:shadow-[0_24px_48px_-12px_rgb(0_0_0_/_0.3)] glass-layer"
    >
      <button
        onClick={() => onToggleExpand(intervention.id)}
        className="w-full p-6 flex items-start gap-5 text-left"
        aria-expanded={isExpanded}
      >
        <div className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-xl", `bg-gradient-to-br ${catConfig.gradient}/15`, `border border-${catConfig.color}-500/20`)}>
          <span style={{ color: `var(--${catConfig.color})` }} className="h-7 w-7 flex items-center justify-center">
            <CategoryIcon className="h-7 w-7" />
          </span>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-5">
            <div>
              <h4 className="font-display font-semibold text-lg">{intervention.name}</h4>
              <p className="text-sm text-ink-muted mt-1 line-clamp-1">{intervention.description}</p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-3xl font-display font-bold text-emerald-400">{impact.toFixed(1)}</span>
                <span className="text-sm text-ink-muted self-end mb-1">yrs</span>
              </div>
              <ChevronDown className={cn("h-6 w-6 text-ink-muted transition-transform duration-300", isExpanded && "rotate-180")} />
            </div>
          </div>
          
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
            <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full", evConfig.bg, evConfig.text, evConfig.border)}>
              {evConfig.label} Evidence
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-seam">
              <DollarSign className="h-3 w-3" />
              {COST_CONFIG[intervention.cost].label}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-seam">
              <Clock className="h-3 w-3" />
              {intervention.timeCommitment}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-seam">
              <Shield className="h-3 w-3" />
              {(intervention.confidence * 100).toFixed(0)}% conf
            </span>
          </div>
        </div>
        
        <div className="w-44 shrink-0">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-ink-muted">Adherence</span>
            <span className="font-medium text-emerald-400">{(intervention.adherence * 100).toFixed(0)}%</span>
          </div>
          <div className="h-2.5 bg-seam rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
              initial={{ width: 0 }}
              animate={{ width: `${intervention.adherence * 100}%` }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="border-t border-seam p-6 bg-surface/30"
          >
            <div className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <Label>Adherence Level</Label>
                  <Slider
                    value={[intervention.adherence]}
                    onValueChange={([value]) => onAdherenceChange(intervention.id, value)}
                    min={0} max={1} step={0.05}
                    className="mt-3"
                  />
                  <div className="flex justify-between text-xs text-ink-muted mt-2">
                    <span>Not doing</span>
                    <span>Perfect</span>
                  </div>
                </div>
                <div>
                  <Label>Projected Impact at Current Adherence</Label>
                  <div className="text-3xl font-display font-bold text-emerald-400 mt-2">{impact.toFixed(2)} years</div>
                </div>
              </div>

              <Separator />

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <Label>Mechanism</Label>
                  <p className="text-sm text-ink-muted mt-2">{intervention.mechanism}</p>
                </div>
                <div>
                  <Label>Tracked Biomarkers</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {intervention.biomarkers.map(b => (
                      <span key={b} className="px-3 py-1 text-xs rounded-full bg-seam text-ink-muted">{b}</span>
                    ))}
                  </div>
                </div>
              </div>

              {intervention.contraindications.length > 0 && (
                <div className="rounded-xl border-l-4 border-amber-500 bg-amber-500/10 p-4">
                  <div className="flex items-center gap-2 text-sm text-amber-400">
                    <AlertCircle className="h-4 w-4" />
                    <strong>Contraindications:</strong>
                  </div>
                  <ul className="mt-3 ml-6 list-disc text-sm text-amber-300 space-y-1">
                    {intervention.contraindications.map(c => <li key={c}>{c}</li>)}
                  </ul>
                </div>
              )}

              <div>
                <Label>Key Citations</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {intervention.citations.map(c => (
                    <span key={c} className="px-3 py-1.5 text-xs rounded bg-seam font-mono text-ink-muted">{c}</span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function BiomarkerCard({ marker }: { marker: { name: string; current: number; projected: number; color: string } }) {
  const improvement = marker.current - marker.projected
  const pctImprovement = ((improvement / marker.current) * 100).toFixed(0)
  const colorMap = { emerald: "#00d97e", cyan: "#06b6d4", amber: "#fbbf24", rose: "#f43f5e" }
  const color = colorMap[marker.color as keyof typeof colorMap] || "#00d97e"
  
  return (
    <Card className="glass-layer group">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-semibold">{marker.name}</h4>
            <p className="text-sm text-ink-muted">Risk percentile</p>
          </div>
          <div className="text-2xl font-display font-bold text-emerald-400">
            {improvement > 0 ? "-" : "+"}{improvement}
          </div>
        </div>
        <div className="mt-5 h-3 bg-seam rounded-full overflow-hidden">
          <motion.div 
            className="h-full transition-all duration-1000"
            initial={{ width: 0 }}
            animate={{ width: `${100 - marker.projected}%` }}
            style={{ backgroundColor: color }}
          />
        </div>
        <div className="flex items-center justify-between mt-3 text-sm">
          <span className="text-ink-muted">Current: {marker.current}th %ile</span>
          <span className="font-medium text-emerald-400">Projected: {marker.projected}th %ile</span>
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm text-emerald-400">
          <TrendingDown className="h-4 w-4" />
          <span>{pctImprovement}% risk reduction</span>
        </div>
      </CardContent>
    </Card>
  )
}

function SimulationPanel({ 
  interventions, userData, biologicalAge, timeHorizon, setTimeHorizon, 
  adherenceScenario, setAdherenceScenario, showDetails, setShowDetails,
  projection, lifeExpectancyGain
}: {
  interventions: Intervention[], userData: UserProfile, biologicalAge: number,
  timeHorizon: number, setTimeHorizon: (v: number) => void,
  adherenceScenario: "current" | "optimistic" | "pessimistic", setAdherenceScenario: (v: "current" | "optimistic" | "pessimistic") => void,
  showDetails: boolean, setShowDetails: (v: boolean) => void,
  projection: { age: number; bioAge: number; gap: number }[], lifeExpectancyGain: number
}) {
  const currentAge = userData.chronologicalAge || 40
  const activeInterventions = interventions.filter(i => i.adherence > 0)
  const scenarioLabels = { pessimistic: "Pessimistic (50% adherence)", current: "Current (your settings)", optimistic: "Optimistic (90% adherence)" }

  return (
    <div className="space-y-8">
      <Card className="glass-layer">
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <Label>Time Horizon</Label>
              <Slider value={[timeHorizon]} onValueChange={([v]) => setTimeHorizon(v)} min={5} max={30} step={5} className="mt-3" />
              <div className="flex justify-between text-sm text-ink-muted mt-2">
                <span>5 years</span>
                <span className="font-medium text-ink">{timeHorizon} years</span>
                <span>30 years</span>
              </div>
            </div>
            <div>
              <Label>Adherence Scenario</Label>
              <Select value={adherenceScenario} onValueChange={setAdherenceScenario as any}>
                <SelectTrigger className="mt-3"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pessimistic">Pessimistic (50% adherence)</SelectItem>
                  <SelectItem value="current">Current (your settings)</SelectItem>
                  <SelectItem value="optimistic">Optimistic (90% adherence)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Projected Life Expectancy Gain</Label>
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-4xl font-display font-bold text-emerald-400">+{lifeExpectancyGain.toFixed(1)}</span>
                <span className="text-ink-muted">years</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-layer">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Biological Age Trajectory</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={380}>
            <AreaChart data={projection} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorChrono" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#64748b" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#64748b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorBio" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d97e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00d97e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" strokeOpacity={0.15} stroke="#334155" />
              <XAxis dataKey="age" tick={{ fill: "currentColor", fontSize: 12, fontFamily: "JetBrains Mono" }} name="Chronological Age" />
              <YAxis tick={{ fill: "currentColor", fontSize: 12, fontFamily: "JetBrains Mono" }} name="Biological Age" />
              <Tooltip labelFormatter={(v) => `Age ${v}`} formatter={(v: any, name: any) => v !== undefined ? [`${v.toFixed(1)} years`, name] : ["", name]} />
              <Area type="monotone" dataKey="bioAge" stroke="#00d97e" fillOpacity={1} fill="url(#colorBio)" strokeWidth={2.5} name="Biological Age" />
              <Line type="monotone" dataKey="age" stroke="#64748b" strokeWidth={2.5} strokeDasharray="6 6" dot={false} name="Chronological Age" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-emerald-500/30 border border-emerald-500" /><span>Biological Age (your plan)</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded border-2 border-dashed border-slate-500" /><span>Chronological Age</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-slate-500/30" /><span>Gap = Healthspan Gain</span></div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-layer">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> Year-by-Year Projection</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setShowDetails(!showDetails)}>
              {showDetails ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              {showDetails ? "Collapse" : "Expand"}
            </Button>
          </div>
        </CardHeader>
        <AnimatePresence>
          {showDetails && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
              <CardContent className="pb-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-seam text-left text-ink-muted">
                        <th className="pb-3 pr-4">Age</th>
                        <th className="pb-3 pr-4">Bio Age</th>
                        <th className="pb-3 pr-4">Gap</th>
                        <th className="pb-3 pr-4">Aging Rate</th>
                        <th className="pb-3 pr-4">Cumulative Gain</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projection.map((p, i) => (
                        <tr key={p.age} className="border-b border-seam/50 last:border-0">
                          <td className="py-3 pr-4 font-medium font-mono">{p.age}</td>
                          <td className="py-3 pr-4">{p.bioAge.toFixed(1)}</td>
                          <td className="py-3 pr-4 font-medium text-emerald-400">+{p.gap.toFixed(1)}</td>
                          <td className="py-3 pr-4 font-mono">{i > 0 ? (p.bioAge - projection[i-1].bioAge).toFixed(2) : "—"}</td>
                          <td className="py-3 pr-4 font-medium text-emerald-400">+{p.gap.toFixed(1)}</td>
                          <td className="py-3">
                            <span className={cn(
                              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs",
                              p.gap > 2 ? "bg-emerald-500/20 text-emerald-400" : p.gap > 0 ? "bg-amber-500/20 text-amber-400" : "bg-rose-500/20 text-rose-400"
                            )}>
                              {p.gap > 2 ? "Excellent" : p.gap > 0 ? "Positive" : "At Risk"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      <Card className="glass-layer">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5" /> What-If Scenarios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-5 md:grid-cols-3">
            <WhatIfCard title="Add One Intervention" description="Highest-impact intervention you're not doing" metric={interventions.filter(i => i.adherence === 0).sort((a, b) => b.effectSize - a.effectSize)[0]?.effectSize || 0} unit="years" icon={Target} color="cyan" />
            <WhatIfCard title="Perfect Adherence" description="90% adherence on all current interventions" metric={activeInterventions.reduce((sum, i) => sum + i.effectSize * (0.9 - i.adherence), 0)} unit="years" icon={TrendingUp} color="emerald" />
            <WhatIfCard title="Drop Lowest Adherence" description="Stop the intervention with lowest adherence" metric={activeInterventions.length > 0 ? -activeInterventions.reduce((min, i) => i.adherence < min.adherence ? i : min).effectSize * activeInterventions.reduce((min, i) => i.adherence < min.adherence ? i : min).adherence : 0} unit="years" icon={TrendingDown} color="rose" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function WhatIfCard({ title, description, metric, unit, icon: Icon, color }: {
  title: string, description: string, metric: number, unit: string, icon: React.ComponentType<{ className?: string }>, color: "cyan" | "emerald" | "rose"
}) {
  const colorMap = {
    cyan: { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/20", iconBg: "bg-cyan-500/20" },
    emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", iconBg: "bg-emerald-500/20" },
    rose: { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/20", iconBg: "bg-rose-500/20" },
  }
  const colors = colorMap[color]
  
  return (
    <div className={cn("rounded-2xl border p-5 text-center", colors.bg, colors.text, colors.border)}>
      <div className={cn("mx-auto mb-4 p-4 rounded-xl", colors.iconBg)}>
        <Icon className={cn("h-7 w-7", colors.text)} />
      </div>
      <h4 className="font-display font-semibold">{title}</h4>
      <p className="text-sm text-ink-muted mt-2">{description}</p>
      <div className="mt-4 flex items-baseline justify-center gap-2">
        <span className={cn("text-4xl font-display font-bold", metric >= 0 ? "text-emerald-400" : "text-rose-400")}>
          {metric >= 0 ? "+" : ""}{metric.toFixed(1)}
        </span>
        <span className="text-ink-muted">{unit}</span>
      </div>
    </div>
  )
}

function EvidenceTimeline({ interventions }: { interventions: Intervention[] }) {
  const activeInterventions = interventions.filter(i => i.adherence > 0)
  
  return (
    <div className="space-y-6">
      {activeInterventions.map((intervention) => {
        const CategoryIcon = CATEGORY_ICONS[intervention.category]
        return (
        <Card key={intervention.id} className="glass-layer overflow-hidden">
          <CardHeader className="pb-5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                <div className={cn("p-3 rounded-xl", CATEGORY_CONFIG[intervention.category].gradient + "/15", `border border-${CATEGORY_CONFIG[intervention.category].color}-500/20`)}>
                  <span style={{ color: `var(--${CATEGORY_CONFIG[intervention.category].color})` }} className="h-6 w-6 flex items-center justify-center">
                    <CategoryIcon className="h-6 w-6" />
                  </span>
                </div>
                <div>
                  <h3 className="font-display font-semibold">{intervention.name}</h3>
                  <p className="text-sm text-ink-muted">Evidence timeline: {intervention.timeline.length} key studies</p>
                </div>
              </div>
              <span className={cn("px-3 py-1.5 text-xs rounded-full font-medium", EVIDENCE_CONFIG[intervention.evidenceLevel].bg, EVIDENCE_CONFIG[intervention.evidenceLevel].text, EVIDENCE_CONFIG[intervention.evidenceLevel].border)}>
                {EVIDENCE_CONFIG[intervention.evidenceLevel].label} Evidence
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative pl-5 border-l border-seam/50">
              {intervention.timeline.map((event, index) => (
                <motion.div key={event.year} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.08 }} className="relative pb-8 last:pb-0">
                  <div className="absolute left-[-24px] top-1 h-6 w-6 rounded-full bg-emerald-500 border-3 border-void" />
                  <div className="ml-6">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-label font-mono text-emerald-400">{event.year}</span>
                      <span className="px-2.5 py-0.5 text-xs rounded bg-seam text-ink-muted capitalize">{event.studyType}</span>
                    </div>
                    <h4 className="font-medium">{event.title}</h4>
                    <p className="text-sm text-ink-muted mt-1">{event.description}</p>
                    <span className="text-micro font-mono text-ink-subtle">{event.citation}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
        )
      })}
    </div>
  )
}