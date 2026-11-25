"use client"

import { useState, useCallback } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn, sanitizeHtml } from "@/lib/utils"
import { ChevronRight, ChevronLeft, CheckCircle, Loader2, Sparkles, BarChart2 } from "lucide-react"
import { interventionDatabase } from "@/lib/utils"

const assessmentSchema = z.object({
  chronologicalAge: z.coerce.number().min(18).max(100),
  sex: z.enum(["male", "female"]),
  ethnicity: z.string().optional(),
  height: z.coerce.number().min(100).max(250).optional(),
  weight: z.coerce.number().min(30).max(200).optional(),
  hba1c: z.coerce.number().min(3).max(15).optional(),
  fastingGlucose: z.coerce.number().min(50).max(300).optional(),
  fastingInsulin: z.coerce.number().min(1).max(100).optional(),
  hdl: z.coerce.number().min(10).max(150).optional(),
  ldl: z.coerce.number().min(20).max(300).optional(),
  triglycerides: z.coerce.number().min(30).max(500).optional(),
  apoB: z.coerce.number().min(20).max(300).optional(),
  hsCRP: z.coerce.number().min(0.1).max(20).optional(),
  vitaminD: z.coerce.number().min(5).max(150).optional(),
  b12: z.coerce.number().min(50).max(2000).optional(),
  testosterone: z.coerce.number().min(50).max(1500).optional(),
  estradiol: z.coerce.number().min(5).max(500).optional(),
  dheaS: z.coerce.number().min(10).max(800).optional(),
  igf1: z.coerce.number().min(20).max(500).optional(),
  cortisol: z.coerce.number().min(1).max(30).optional(),
  egfr: z.coerce.number().min(15).max(150).optional(),
  alt: z.coerce.number().min(5).max(300).optional(),
  ast: z.coerce.number().min(5).max(300).optional(),
  vo2max: z.coerce.number().min(15).max(80).optional(),
  restingHR: z.coerce.number().min(35).max(120).optional(),
  hrv: z.coerce.number().min(10).max(150).optional(),
  gripStrength: z.coerce.number().min(10).max(80).optional(),
  bodyFatPct: z.coerce.number().min(5).max(50).optional(),
  phenoAge: z.coerce.number().min(18).max(120).optional(),
  dunedinPace: z.coerce.number().min(0.5).max(2.0).optional(),
  sleepHours: z.coerce.number().min(3).max(12).optional(),
  sleepQuality: z.coerce.number().min(1).max(10).optional(),
  exerciseHoursWeek: z.coerce.number().min(0).max(30).optional(),
  dietQuality: z.coerce.number().min(1).max(10).optional(),
  stressLevel: z.coerce.number().min(1).max(10).optional(),
  alcoholDrinksWeek: z.coerce.number().min(0).max(50).optional(),
  smokingStatus: z.enum(["never", "former", "current"]).optional(),
  currentMeds: z.string().optional(),
  currentSupplements: z.string().optional(),
})

export type AssessmentData = z.infer<typeof assessmentSchema>

const STEPS = [
  { id: "demographics", title: "Demographics", description: "Basic information to personalize your longevity profile", icon: "👤" },
  { id: "bloodwork", title: "Blood Work", description: "Recent blood work (last 6 months). Leave blank if unavailable.", icon: "🩸" },
  { id: "hormones", title: "Hormones & Nutrients", description: "Hormone panel and nutrient levels. Optional but recommended.", icon: "🧪" },
  { id: "organ", title: "Organ Function", description: "Liver and kidney function markers.", icon: "🫀" },
  { id: "bodycomp", title: "Body & Fitness", description: "Fitness and body composition metrics.", icon: "💪" },
  { id: "epigenetic", title: "Epigenetic Clocks", description: "If you've taken epigenetic age tests (optional).", icon: "🧬" },
  { id: "lifestyle", title: "Lifestyle", description: "Daily habits that significantly impact aging trajectory.", icon: "🌙" },
  { id: "meds", title: "Meds & Supplements", description: "Current prescriptions and supplements for interaction checking.", icon: "💊" },
]

const stepFields: Record<string, (keyof AssessmentData)[]> = {
  demographics: ["chronologicalAge", "sex", "ethnicity", "height", "weight"],
  bloodwork: ["hba1c", "fastingGlucose", "fastingInsulin", "hdl", "ldl", "triglycerides", "apoB", "hsCRP"],
  hormones: ["vitaminD", "b12", "testosterone", "estradiol", "dheaS", "igf1", "cortisol"],
  organ: ["egfr", "alt", "ast"],
  bodycomp: ["vo2max", "restingHR", "hrv", "gripStrength", "bodyFatPct"],
  epigenetic: ["phenoAge", "dunedinPace"],
  lifestyle: ["sleepHours", "sleepQuality", "exerciseHoursWeek", "dietQuality", "stressLevel", "alcoholDrinksWeek", "smokingStatus"],
  meds: ["currentMeds", "currentSupplements"],
}

const fieldConfig: Record<keyof AssessmentData, { label: string; unit?: string; placeholder?: string; type?: "number" | "text" | "select"; options?: { value: string; label: string }[] }> = {
  chronologicalAge: { label: "Chronological Age", unit: "years", placeholder: "45" },
  sex: { label: "Biological Sex", type: "select", options: [{ value: "male", label: "Male" }, { value: "female", label: "Female" }] },
  ethnicity: { label: "Ethnicity (optional)", type: "text", placeholder: "e.g., South Asian, European, East Asian" },
  height: { label: "Height", unit: "cm", placeholder: "175" },
  weight: { label: "Weight", unit: "kg", placeholder: "75" },
  hba1c: { label: "HbA1c", unit: "%", placeholder: "5.2" },
  fastingGlucose: { label: "Fasting Glucose", unit: "mg/dL", placeholder: "90" },
  fastingInsulin: { label: "Fasting Insulin", unit: "μIU/mL", placeholder: "6" },
  hdl: { label: "HDL Cholesterol", unit: "mg/dL", placeholder: "55" },
  ldl: { label: "LDL Cholesterol", unit: "mg/dL", placeholder: "110" },
  triglycerides: { label: "Triglycerides", unit: "mg/dL", placeholder: "85" },
  apoB: { label: "ApoB", unit: "mg/dL", placeholder: "90" },
  hsCRP: { label: "hs-CRP", unit: "mg/L", placeholder: "1.2" },
  vitaminD: { label: "Vitamin D (25-OH)", unit: "ng/mL", placeholder: "45" },
  b12: { label: "Vitamin B12", unit: "pg/mL", placeholder: "500" },
  testosterone: { label: "Total Testosterone", unit: "ng/dL", placeholder: "550" },
  estradiol: { label: "Estradiol", unit: "pg/mL", placeholder: "30" },
  dheaS: { label: "DHEA-S", unit: "μg/dL", placeholder: "250" },
  igf1: { label: "IGF-1", unit: "ng/mL", placeholder: "180" },
  cortisol: { label: "Morning Cortisol", unit: "μg/dL", placeholder: "14" },
  egfr: { label: "eGFR", unit: "mL/min/1.73m²", placeholder: "95" },
  alt: { label: "ALT", unit: "U/L", placeholder: "22" },
  ast: { label: "AST", unit: "U/L", placeholder: "20" },
  vo2max: { label: "VO₂ Max", unit: "mL/kg/min", placeholder: "42" },
  restingHR: { label: "Resting Heart Rate", unit: "bpm", placeholder: "58" },
  hrv: { label: "HRV (RMSSD)", unit: "ms", placeholder: "55" },
  gripStrength: { label: "Grip Strength", unit: "kg", placeholder: "40" },
  bodyFatPct: { label: "Body Fat %", unit: "%", placeholder: "20" },
  phenoAge: { label: "PhenoAge", unit: "years", placeholder: "42" },
  dunedinPace: { label: "DunedinPACE", unit: "years/year", placeholder: "0.85" },
  sleepHours: { label: "Sleep Duration", unit: "hours/night", placeholder: "7.5" },
  sleepQuality: { label: "Sleep Quality", unit: "/10", placeholder: "7" },
  exerciseHoursWeek: { label: "Exercise", unit: "hrs/week", placeholder: "5" },
  dietQuality: { label: "Diet Quality", unit: "/10", placeholder: "7" },
  stressLevel: { label: "Stress Level", unit: "/10", placeholder: "4" },
  alcoholDrinksWeek: { label: "Alcohol", unit: "drinks/week", placeholder: "3" },
  smokingStatus: { label: "Smoking Status", type: "select", options: [{ value: "never", label: "Never" }, { value: "former", label: "Former" }, { value: "current", label: "Current" }] },
  currentMeds: { label: "Current Medications", type: "text", placeholder: "e.g., Metformin 500mg, Lisinopril 10mg" },
  currentSupplements: { label: "Current Supplements", type: "text", placeholder: "e.g., Omega-3, Vitamin D3, Creatine" },
}

const demoProfiles = {
  optimal: {
    chronologicalAge: 40, sex: "male" as const, height: 180, weight: 75,
    hba1c: 5.0, fastingGlucose: 85, fastingInsulin: 4, hdl: 65, ldl: 90, triglycerides: 70, apoB: 75, hsCRP: 0.5,
    vitaminD: 60, b12: 600, testosterone: 650, estradiol: 25, dheaS: 350, igf1: 200, cortisol: 12,
    egfr: 105, alt: 18, ast: 18, vo2max: 50, restingHR: 50, hrv: 70, gripStrength: 50, bodyFatPct: 15,
    phenoAge: 35, dunedinPace: 0.7, sleepHours: 8, sleepQuality: 9, exerciseHoursWeek: 7, dietQuality: 9,
    stressLevel: 2, alcoholDrinksWeek: 2, smokingStatus: "never" as const,
    currentMeds: "None", currentSupplements: "Omega-3, Vitamin D3, Creatine, Magnesium",
  },
  average: {
    chronologicalAge: 50, sex: "female" as const, height: 165, weight: 72,
    hba1c: 5.5, fastingGlucose: 95, fastingInsulin: 10, hdl: 55, ldl: 130, triglycerides: 120, apoB: 105, hsCRP: 2.5,
    vitaminD: 32, b12: 400, testosterone: 45, estradiol: 35, dheaS: 180, igf1: 140, cortisol: 16,
    egfr: 85, alt: 25, ast: 22, vo2max: 32, restingHR: 68, hrv: 40, gripStrength: 28, bodyFatPct: 30,
    phenoAge: 54, dunedinPace: 1.1, sleepHours: 6.5, sleepQuality: 6, exerciseHoursWeek: 2, dietQuality: 5,
    stressLevel: 6, alcoholDrinksWeek: 5, smokingStatus: "former" as const,
    currentMeds: "None", currentSupplements: "Multivitamin",
  },
  high_risk: {
    chronologicalAge: 60, sex: "male" as const, height: 175, weight: 95,
    hba1c: 6.2, fastingGlucose: 115, fastingInsulin: 18, hdl: 40, ldl: 160, triglycerides: 200, apoB: 140, hsCRP: 5.5,
    vitaminD: 22, b12: 300, testosterone: 350, estradiol: 40, dheaS: 100, igf1: 100, cortisol: 22,
    egfr: 70, alt: 35, ast: 30, vo2max: 24, restingHR: 80, hrv: 25, gripStrength: 32, bodyFatPct: 35,
    phenoAge: 68, dunedinPace: 1.4, sleepHours: 5.5, sleepQuality: 4, exerciseHoursWeek: 0.5, dietQuality: 3,
    stressLevel: 8, alcoholDrinksWeek: 10, smokingStatus: "current" as const,
    currentMeds: "Metformin 1000mg, Lisinopril 20mg, Atorvastatin 20mg", currentSupplements: "None",
  },
}

interface AssessmentFormProps {
  onComplete: (data: AssessmentData) => void
  isLoading?: boolean
}

export function AssessmentForm({ onComplete, isLoading }: AssessmentFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AssessmentData>({
    resolver: zodResolver(assessmentSchema) as any,
    defaultValues: { sex: "male", smokingStatus: "never" },
    mode: "onChange",
  })

  const watchedValues = useWatch({ control }) as AssessmentData

  const isStepValid = (stepIndex: number) => {
    const stepId = STEPS[stepIndex].id
    const fields = stepFields[stepId]
    return fields.every(field => !errors[field as keyof AssessmentData])
  }

  const hasDataInStep = (stepIndex: number) => {
    const stepId = STEPS[stepIndex].id
    const fields = stepFields[stepId]
    return fields.some(field => {
      const value = watchedValues[field as keyof AssessmentData]
      return value !== undefined && value !== "" && value !== null
    })
  }

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      if (isStepValid(currentStep) || !hasDataInStep(currentStep)) {
        setCompletedSteps(prev => new Set(prev).add(currentStep))
        setCurrentStep(currentStep + 1)
      }
    } else {
      handleSubmit(onSubmit as any)()
    }
  }

  const onSubmit = (data: AssessmentData) => {
    const sanitized: AssessmentData = {
      ...data,
      ethnicity: data.ethnicity ? sanitizeHtml(data.ethnicity) : undefined,
      currentMeds: data.currentMeds ? sanitizeHtml(data.currentMeds) : undefined,
      currentSupplements: data.currentSupplements ? sanitizeHtml(data.currentSupplements) : undefined,
    }
    onComplete(sanitized)
  }

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1)
  }

  const renderField = (fieldName: keyof AssessmentData) => {
    const config = fieldConfig[fieldName]
    const error = errors[fieldName]
    const isSelect = config.type === "select"
    const isText = config.type === "text"

    return (
      <motion.div key={String(fieldName)} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-2">
        <Label htmlFor={fieldName} className="text-sm font-medium text-ink">
          {config.label} {config.unit && <span className="text-ink-subtle text-xs ml-1">({config.unit})</span>}
        </Label>
        {isSelect ? (
          <Select
            onValueChange={(value) => {
              setValue(fieldName, value as any)
            }}
            value={watchedValues[fieldName] as string || ""}
          >
            <SelectTrigger id={fieldName} className={cn(error && "border-rose-500 focus-visible:ring-rose-500")}>
              <SelectValue placeholder={config.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {config.options?.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : isText ? (
          <Input
            id={fieldName}
            placeholder={config.placeholder}
            className={cn(error && "border-rose-500 focus-visible:ring-rose-500")}
            {...register(fieldName)}
          />
        ) : (
          <Input
            id={fieldName}
            type="number"
            step="any"
            placeholder={config.placeholder}
            className={cn(error && "border-rose-500 focus-visible:ring-rose-500")}
            {...register(fieldName)}
          />
        )}
        {error && (
          <p className="text-xs text-rose-400" role="alert">{error.message}</p>
        )}
      </motion.div>
    )
  }

  const currentStepData = STEPS[currentStep]
  const stepFieldsList = stepFields[currentStepData.id]

  return (
    <section id="assessment" className="relative py-16 md:py-24">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-title font-display font-bold">Health Assessment</h2>
                <p className="text-lede mt-2">Step {currentStep + 1} of {STEPS.length} — {currentStepData.title}</p>
              </div>
              <div className="hidden lg:block w-64 h-1.5 bg-seam rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between overflow-x-auto pb-3 gap-2">
              {STEPS.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex flex-col items-center gap-2 flex-shrink-0"
                >
                  <div className={cn(
                    "relative flex h-12 w-12 items-center justify-center rounded-xl border-2 transition-all",
                    index < currentStep
                      ? "bg-emerald-500 border-emerald-500 text-void"
                      : index === currentStep
                      ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                      : "bg-surface border-seam text-ink-subtle"
                  )}>
                    {index < currentStep ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  <span className={cn(
                    "text-micro font-medium max-w-[80px] text-center",
                    index <= currentStep ? "text-ink" : "text-ink-subtle"
                  )}>
                    {step.title}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit(onComplete as any)}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <Card className="glass-layer-strong">
                  <CardHeader className="pb-5">
                    <CardTitle className="text-2xl font-display">{currentStepData.title}</CardTitle>
                    <CardDescription className="text-base">{currentStepData.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <div className="grid gap-6 md:grid-cols-2">
                      {stepFieldsList.map(fieldName => renderField(fieldName))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between mt-10">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
              
              <div className="flex gap-3">
                {currentStep < STEPS.length - 1 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={isSubmitting || isLoading}
                    className="gap-2"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    size="xl"
                    loading={isSubmitting || isLoading}
                    className="gap-2"
                  >
                    <Loader2 className="h-6 w-6 animate-spin" />
                    Generate My Longevity Plan
                    <Sparkles className="h-6 w-6" />
                    <BarChart2 className="h-6 w-6" />
                  </Button>
                )}
              </div>
            </div>
          </form>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-10 p-5 rounded-2xl bg-surface/50 border border-seam/50"
          >
            <p className="text-sm text-ink-muted mb-4">Quick start with demo profiles:</p>
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fillDemoProfile("optimal")}
              >
                Optimal 40yo
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fillDemoProfile("average")}
              >
                Average 50yo
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fillDemoProfile("high_risk")}
              >
                High Risk 60yo
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )

  function fillDemoProfile(profile: "optimal" | "average" | "high_risk") {
    const data = demoProfiles[profile]
    Object.entries(data).forEach(([key, value]) => {
      setValue(key as keyof AssessmentData, value as any)
    })
    setCompletedSteps(new Set(Array.from({ length: STEPS.length - 1 }, (_, i) => i)))
    setCurrentStep(STEPS.length - 1)
  }
}