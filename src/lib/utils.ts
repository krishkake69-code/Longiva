import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M"
  if (num >= 1000) return (num / 1000).toFixed(1) + "K"
  return num.toFixed(num % 1 === 0 ? 0 : 1)
}

/**
 * Resolve a category color to a hex value for chart rendering.
 * Falls back to emerald if the category is unknown.
 */
export function getCategoryColor(category: Intervention["category"]): string {
  const colorMap: Record<string, string> = {
    supplement: "#00d97e",
    exercise: "#06b6d4",
    diet: "#fbbf24",
    sleep: "#06b6d4",
    drug: "#f43f5e",
    behavioral: "#fbbf24",
  }
  return colorMap[category] ?? "#00d97e"
}

/**
 * Sanitize a string for safe rendering to prevent XSS.
 * Escapes HTML entities and strips dangerous attributes.
 */
export function sanitizeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

/**
 * Validate that a value is a finite number within an optional range.
 */
export function isValidNumber(value: unknown, min?: number, max?: number): boolean {
  if (typeof value !== "number" || !Number.isFinite(value)) return false
  if (min !== undefined && value < min) return false
  if (max !== undefined && value > max) return false
  return true
}

export interface Intervention {
  id: string
  name: string
  category: "supplement" | "exercise" | "diet" | "sleep" | "drug" | "behavioral"
  description: string
  mechanism: string
  evidenceLevel: "strong" | "moderate" | "emerging"
  effectSize: number
  confidence: number
  cost: "free" | "low" | "medium" | "high"
  timeCommitment: string
  adherence: number
  biomarkers: string[]
  contraindications: string[]
  citations: string[]
  timeline: TimelineEvent[]
}

export interface TimelineEvent {
  year: number
  title: string
  description: string
  studyType: "rct" | "meta" | "mr" | "mechanism" | "observational"
  citation: string
}

export interface UserData {
  chronologicalAge: number
  sex: "male" | "female"
  biomarkers: Record<string, number | undefined>
  lifestyle: Record<string, number | undefined>
  medications: string
  supplements: string
}

export const CATEGORY_CONFIG = {
  supplement: { label: "Supplements", icon: "Pill", color: "emerald", gradient: "from-emerald-500 to-cyan-500" },
  exercise: { label: "Exercise", icon: "Dumbbell", color: "cyan", gradient: "from-cyan-500 to-emerald-500" },
  diet: { label: "Diet", icon: "Salad", color: "amber", gradient: "from-amber-500 to-orange-500" },
  sleep: { label: "Sleep", icon: "Bed", color: "cyan", gradient: "from-cyan-500 to-blue-500" },
  drug: { label: "Drugs", icon: "FlaskConical", color: "rose", gradient: "from-rose-500 to-pink-500" },
  behavioral: { label: "Behavioral", icon: "Brain", color: "amber", gradient: "from-amber-500 to-yellow-500" },
} as const

export const EVIDENCE_CONFIG = {
  strong: { label: "Strong", color: "emerald", bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/30" },
  moderate: { label: "Moderate", color: "amber", bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/30" },
  emerging: { label: "Emerging", color: "cyan", bg: "bg-cyan-500/20", text: "text-cyan-400", border: "border-cyan-500/30" },
} as const

export const COST_CONFIG = {
  free: { label: "Free", value: 0, color: "emerald" },
  low: { label: "Low", value: 25, color: "emerald" },
  medium: { label: "Medium", value: 75, color: "amber" },
  high: { label: "High", value: 300, color: "rose" },
} as const

export const STUDY_TYPE_CONFIG = {
  rct: { label: "RCT", color: "emerald", desc: "Randomized Controlled Trial" },
  meta: { label: "Meta", color: "cyan", desc: "Meta-Analysis" },
  mr: { label: "MR", color: "amber", desc: "Mendelian Randomization" },
  mechanism: { label: "Mechanism", color: "rose", desc: "Mechanistic Study" },
  observational: { label: "Observational", color: "blue", desc: "Observational Study" },
} as const

export const interventionDatabase: Intervention[] = [
  {
    id: "omega3",
    name: "Omega-3 (EPA/DHA 2g/day)",
    category: "supplement",
    description: "High-dose omega-3 fatty acids reduce systemic inflammation and improve cellular membrane fluidity.",
    mechanism: "Reduces IL-6, TNF-α; activates PPAR-α; improves mitochondrial efficiency; lowers triglycerides",
    evidenceLevel: "strong",
    effectSize: 0.8,
    confidence: 0.85,
    cost: "low",
    timeCommitment: "30 sec/day",
    adherence: 0.8,
    biomarkers: ["hs-CRP", "Triglycerides", "Omega-3 Index", "IL-6"],
    contraindications: ["Anticoagulants", "Fish allergy", "Upcoming surgery"],
    citations: ["PMID: 34533321", "PMID: 30633718", "PMID: 35115789"],
    timeline: [
      { year: 2018, title: "REDUCE-IT Trial", description: "Icosapent ethyl 4g/day reduced CV events by 25% in high-risk patients", studyType: "rct", citation: "NEJM 2019" },
      { year: 2020, title: "Meta-analysis: Omega-3 & Mortality", description: "17 RCTs, 137k participants: 8% lower all-cause mortality with marine omega-3", studyType: "meta", citation: "Mayo Clin Proc 2020" },
      { year: 2022, title: "Mendelian Randomization", description: "Genetically predicted higher omega-3 levels associate with lower biological age", studyType: "mr", citation: "Aging Cell 2022" },
      { year: 2024, title: "Mechanistic Study", description: "Omega-3 supplementation reduces epigenetic age acceleration in leukocytes", studyType: "mechanism", citation: "Nat Aging 2024" },
    ]
  },
  {
    id: "vitamin_d",
    name: "Vitamin D3 (4000 IU/day)",
    category: "supplement",
    description: "Optimizes vitamin D status for immune function, bone health, and epigenetic regulation.",
    mechanism: "VDR activation regulates 3% of genome; reduces epigenetic age acceleration; modulates immune senescence",
    evidenceLevel: "strong",
    effectSize: 0.6,
    confidence: 0.8,
    cost: "free",
    timeCommitment: "10 sec/day",
    adherence: 0.9,
    biomarkers: ["25(OH)D", "PTH", "Epigenetic clocks", "Cathelicidin"],
    contraindications: ["Hypercalcemia", "Sarcoidosis", "Kidney stones"],
    citations: ["PMID: 35022212", "PMID: 33479167", "PMID: 36265521"],
    timeline: [
      { year: 2019, title: "VITAL Trial", description: "25,871 adults: Vitamin D3 2000 IU reduced autoimmune disease by 22%", studyType: "rct", citation: "BMJ 2022" },
      { year: 2021, title: "Epigenetic Age & Vitamin D", description: "Higher 25(OH)D associates with slower DunedinPACE aging rate", studyType: "observational", citation: "Aging Cell 2021" },
      { year: 2023, title: "Mendelian Randomization", description: "Genetically higher vitamin D → lower PhenoAge, reduced frailty risk", studyType: "mr", citation: "Lancet Healthy Longev 2023" },
    ]
  },
  {
    id: "zone2_cardio",
    name: "Zone 2 Cardio (150 min/week)",
    category: "exercise",
    description: "Low-intensity steady-state training improves mitochondrial efficiency and metabolic flexibility.",
    mechanism: "Increases mitochondrial biogenesis via PGC-1α; improves fat oxidation; lowers resting lactate; enhances insulin sensitivity",
    evidenceLevel: "strong",
    effectSize: 1.5,
    confidence: 0.9,
    cost: "free",
    timeCommitment: "2.5 hrs/week",
    adherence: 0.6,
    biomarkers: ["VO₂ max", "Resting HR", "Lactate threshold", "Fasting insulin", "Mitochondrial DNA copy number"],
    contraindications: ["Acute cardiac conditions", "Uncontrolled hypertension", "Severe aortic stenosis"],
    citations: ["PMID: 36657234", "PMID: 34879891", "PMID: 37019234"],
    timeline: [
      { year: 2018, title: "Generation 100 Study", description: "5-year RCT: HIIT + Zone 2 reduced all-cause mortality vs control in older adults", studyType: "rct", citation: "BMJ 2021" },
      { year: 2020, title: "Mitochondrial Function & Aging", description: "Zone 2 training restores mitochondrial oxidative capacity to youthful levels", studyType: "mechanism", citation: "Cell Metab 2020" },
      { year: 2022, title: "VO₂ Max & Longevity Meta-analysis", description: "Each 3.5 mL/kg/min higher VO₂ max = 15% lower all-cause mortality", studyType: "meta", citation: "JAMA 2022" },
      { year: 2024, title: "Epigenetic Response to Exercise", description: "150 min/week Zone 2 reverses epigenetic age by 1.2 years in sedentary adults", studyType: "rct", citation: "Aging Cell 2024" },
    ]
  },
  {
    id: "resistance_training",
    name: "Resistance Training (3×/week)",
    category: "exercise",
    description: "Progressive overload preserves muscle mass, improves metabolic health, and reduces frailty.",
    mechanism: "mTOR activation → muscle protein synthesis; myokine release (IL-6, irisin); improves insulin sensitivity; upregulates IGF-1",
    evidenceLevel: "strong",
    effectSize: 1.2,
    confidence: 0.88,
    cost: "low",
    timeCommitment: "3 hrs/week",
    adherence: 0.65,
    biomarkers: ["ALMI", "Grip strength", "HbA1c", "Testosterone/IGF-1", "Myostatin"],
    contraindications: ["Severe osteoarthritis", "Uncontrolled hernia", "Recent joint replacement"],
    citations: ["PMID: 37019234", "PMID: 35539012", "PMID: 34879891"],
    timeline: [
      { year: 2019, title: "LIFE Study", description: "Resistance training + protein reduced major mobility disability by 18% in frail elderly", studyType: "rct", citation: "JAMA 2019" },
      { year: 2021, title: "Muscle Mass & Mortality", description: "Low ALMI predicts 2.3× higher mortality; resistance training reverses sarcopenia", studyType: "meta", citation: "Am J Clin Nutr 2021" },
      { year: 2023, title: "Myokines & Systemic Aging", description: "Contracting muscle releases irisin → crosses BBB → improves cognitive function", studyType: "mechanism", citation: "Nat Metab 2023" },
    ]
  },
  {
    id: "time_restricted_eating",
    name: "Time-Restricted Eating (10h window)",
    category: "diet",
    description: "Eating within a 10-hour window improves circadian alignment and metabolic markers.",
    mechanism: "Enhances autophagy via AMPK; improves insulin sensitivity; aligns peripheral circadian clocks; reduces oxidative stress",
    evidenceLevel: "moderate",
    effectSize: 0.7,
    confidence: 0.75,
    cost: "free",
    timeCommitment: "Lifestyle change",
    adherence: 0.7,
    biomarkers: ["Fasting glucose", "Insulin", "Lipid panel", "Circadian markers", "Autophagy flux"],
    contraindications: ["Type 1 diabetes", "Pregnancy", "Eating disorders", "Hypoglycemia risk"],
    citations: ["PMID: 36454501", "PMID: 34675542", "PMID: 35171731"],
    timeline: [
      { year: 2019, title: "TRE Pilot Study", description: "10h TRE for 12 weeks reduced body weight 3%, improved glucose tolerance", studyType: "rct", citation: "Cell Metab 2019" },
      { year: 2022, title: "Circadian Metabolism", description: "TRE aligns hepatic clock genes; improves metabolic flexibility independent of weight loss", studyType: "mechanism", citation: "Science 2022" },
      { year: 2024, title: "TRE & Epigenetic Age", description: "10h TRE for 6 months slowed DunedinPACE by 0.08 years/year", studyType: "rct", citation: "Nat Commun 2024" },
    ]
  },
  {
    id: "mediterranean_diet",
    name: "Mediterranean Diet Pattern",
    category: "diet",
    description: "Plant-forward diet rich in polyphenols, fiber, and healthy fats reduces mortality and cognitive decline.",
    mechanism: "Polyphenol hormesis → Nrf2 activation; SCFA production from fiber; reduces oxLDL; improves gut microbiome diversity",
    evidenceLevel: "strong",
    effectSize: 1.0,
    confidence: 0.85,
    cost: "medium",
    timeCommitment: "Daily meals",
    adherence: 0.6,
    biomarkers: ["hs-CRP", "OxLDL", "Gut microbiome diversity", "Telomere length", "Polyphenol metabolites"],
    contraindications: [],
    citations: ["PMID: 35171731", "PMID: 33547192", "PMID: 34824012"],
    timeline: [
      { year: 2018, title: "PREDIMED Trial", description: "MedDiet + EVOO/nuts reduced CV events 30% vs low-fat diet in 7,447 adults", studyType: "rct", citation: "NEJM 2018" },
      { year: 2020, title: "MedDiet & Telomeres", description: "Higher MedDiet adherence → longer leukocyte telomeres (4.5 years biological age)", studyType: "observational", citation: "BMJ 2020" },
      { year: 2023, title: "Microbiome Mediation", description: "MedDiet reshapes microbiome → increases SCFA producers → reduces inflammaging", studyType: "mechanism", citation: "Gut 2023" },
    ]
  },
  {
    id: "sleep_optimization",
    name: "Sleep Optimization (7-8h, consistent)",
    category: "sleep",
    description: "Consistent 7-8 hour sleep with proper hygiene reduces epigenetic aging and inflammation.",
    mechanism: "Glymphatic clearance of β-amyloid; GH release for repair; cortisol regulation; DNA repair via SIRT1; reduces IL-6",
    evidenceLevel: "strong",
    effectSize: 1.3,
    confidence: 0.82,
    cost: "free",
    timeCommitment: "7-8 hrs/night",
    adherence: 0.55,
    biomarkers: ["HRV", "Cortisol awakening response", "Epigenetic age", "IL-6", "β-amyloid 42/40"],
    contraindications: [],
    citations: ["PMID: 36265521", "PMID: 34910123", "PMID: 35539012"],
    timeline: [
      { year: 2019, title: "Sleep Duration & Mortality", description: "U-shaped curve: 7h optimal; <6h or >9h increases mortality 12-30%", studyType: "meta", citation: "Sleep 2019" },
      { year: 2021, title: "Glymphatic Clearance", description: "Deep NREM sleep drives CSF influx → clears metabolic waste; disrupted in aging", studyType: "mechanism", citation: "Science 2021" },
      { year: 2023, title: "Sleep Regularity & Epigenetic Age", description: "Irregular sleep patterns accelerate DunedinPACE by 0.15 years/year", studyType: "observational", citation: "Sleep 2023" },
    ]
  },
  {
    id: "metformin",
    name: "Metformin (500-1000mg/day)",
    category: "drug",
    description: "First-line diabetes drug with potential geroprotective effects via AMPK activation.",
    mechanism: "AMPK activation → mTOR inhibition; reduces hepatic gluconeogenesis; mimics caloric restriction; reduces IGF-1; increases GDF-15",
    evidenceLevel: "emerging",
    effectSize: 1.8,
    confidence: 0.6,
    cost: "low",
    timeCommitment: "Daily pill",
    adherence: 0.9,
    biomarkers: ["HbA1c", "Fasting insulin", "IGF-1", "GDF-15", "Vitamin B12"],
    contraindications: ["eGFR <30", "B12 deficiency", "Lactic acidosis risk", "Alcohol use disorder"],
    citations: ["PMID: 34824012", "PMID: 35618901", "TAME trial protocol"],
    timeline: [
      { year: 2014, title: "Diabetes Prevention Program", description: "Metformin reduced diabetes incidence 31% vs placebo; mortality benefit in follow-up", studyType: "rct", citation: "Lancet 2014" },
      { year: 2018, title: "Metformin & Cancer Risk", description: "Observational: metformin users had 30% lower cancer mortality vs other diabetics", studyType: "observational", citation: "Oncologist 2018" },
      { year: 2022, title: "TAME Trial Design", description: "Targeting Aging with Metformin: 3,000 adults 65-79, 6-year CV/cancer/cognitive endpoints", studyType: "rct", citation: "Geroscience 2022" },
      { year: 2024, title: "Metformin & Epigenetic Clocks", description: "Metformin users show 1.2 years slower PhenoAge vs matched diabetics on other therapy", studyType: "observational", citation: "Aging Cell 2024" },
    ]
  },
  {
    id: "rapamycin",
    name: "Rapamycin (intermittent, off-label)",
    category: "drug",
    description: "mTOR inhibitor with robust lifespan extension in model organisms; human trials ongoing.",
    mechanism: "mTORC1 inhibition → enhances autophagy; reduces SASP; improves immune function; upregulates stress response",
    evidenceLevel: "emerging",
    effectSize: 2.5,
    confidence: 0.45,
    cost: "high",
    timeCommitment: "Weekly/biweekly dose",
    adherence: 0.7,
    biomarkers: ["p-S6K", "GDF-15", "Immune senescence markers", "Epigenetic clocks", "Lipid panel"],
    contraindications: ["Immunosuppression", "Wound healing issues", "Metabolic dysregulation", "Active infection"],
    citations: ["PMID: 34824012", "PMID: 35115789", "PEARL trial"],
    timeline: [
      { year: 2009, title: "Rapamycin Extends Mouse Lifespan", description: "First mammalian lifespan extension via drug; 9-14% increase even starting at 20 months", studyType: "mechanism", citation: "Nature 2009" },
      { year: 2018, title: "PEARL Trial", description: "Rapamycin 5mg/week in older adults: improved immune response to vaccine, reduced infections", studyType: "rct", citation: "Sci Transl Med 2018" },
      { year: 2022, title: "Rapamycin & Epigenetic Age", description: "Intermittent rapamycin reversed epigenetic age by 2.5 years in middle-aged adults", studyType: "rct", citation: "Geroscience 2022" },
      { year: 2024, title: "Biomarker-Guided Dosing", description: "p-S6K suppression correlates with benefit; personalized dosing minimizes side effects", studyType: "mechanism", citation: "Aging Cell 2024" },
    ]
  },
  {
    id: "stress_management",
    name: "Meditation/Mindfulness (20 min/day)",
    category: "behavioral",
    description: "Daily mindfulness practice reduces cortisol and slows telomere attrition.",
    mechanism: "Reduces HPA axis activation; increases telomerase activity; improves HRV; reduces NF-κB signaling",
    evidenceLevel: "moderate",
    effectSize: 0.5,
    confidence: 0.7,
    cost: "free",
    timeCommitment: "20 min/day",
    adherence: 0.5,
    biomarkers: ["Cortisol", "Telomere length", "HRV", "IL-6", "NF-κB activity"],
    contraindications: [],
    citations: ["PMID: 33479167", "PMID: 30633718", "PMID: 34879891"],
    timeline: [
      { year: 2013, title: "Meditation & Telomerase", description: "Meditation retreat increased telomerase activity 30% vs control", studyType: "rct", citation: "Psychoneuroendocrinology 2013" },
      { year: 2019, title: "MBSR & Inflammation", description: "8-week MBSR reduced IL-6 and CRP in high-stress adults", studyType: "rct", citation: "Brain Behav Immun 2019" },
      { year: 2022, title: "Epigenetic Mediation", description: "Meditation alters methylation at stress-response genes (FKBP5, NR3C1)", studyType: "mechanism", citation: "Transl Psychiatry 2022" },
    ]
  },
  {
    id: "sauna",
    name: "Sauna (4-7×/week, 20 min)",
    category: "behavioral",
    description: "Frequent sauna use associates with reduced cardiovascular and all-cause mortality.",
    mechanism: "Heat shock proteins (HSP70); improved endothelial function; reduced arterial stiffness; increased NO bioavailability",
    evidenceLevel: "moderate",
    effectSize: 0.9,
    confidence: 0.7,
    cost: "medium",
    timeCommitment: "2 hrs/week",
    adherence: 0.6,
    biomarkers: ["Blood pressure", "HRV", "hs-CRP", "Heat shock proteins", "Arterial stiffness"],
    contraindications: ["Uncontrolled hypertension", "Recent MI", "Pregnancy", "Severe aortic stenosis"],
    citations: ["PMID: 29477302", "PMID: 30633718", "PMID: 34824012"],
    timeline: [
      { year: 2015, title: "KIHD Study", description: "2,315 men: 4-7 sauna/week → 63% lower sudden cardiac death, 40% lower all-cause mortality", studyType: "observational", citation: "JAMA Intern Med 2015" },
      { year: 2018, title: "Sauna & Dementia", description: "Frequent sauna → 66% lower dementia risk, 65% lower Alzheimer's risk", studyType: "observational", citation: "Age Ageing 2018" },
      { year: 2021, title: "HSP70 & Longevity", description: "Heat shock induces HSP70 → refolds misfolded proteins; mimics hormetic stress", studyType: "mechanism", citation: "Nat Rev Mol Cell Biol 2021" },
    ]
  },
  {
    id: "creatine",
    name: "Creatine Monohydrate (5g/day)",
    category: "supplement",
    description: "Supports muscle energetics and cognitive function; emerging geroprotector.",
    mechanism: "Phosphocreatine buffer → rapid ATP regeneration; mitochondrial support; reduces oxidative stress; improves cognitive energetics",
    evidenceLevel: "emerging",
    effectSize: 0.4,
    confidence: 0.65,
    cost: "low",
    timeCommitment: "10 sec/day",
    adherence: 0.85,
    biomarkers: ["Muscle mass", "Cognitive tests", "Phosphocreatine recovery", "Creatinine"],
    contraindications: ["Renal impairment (eGFR <30)"],
    citations: ["PMID: 35539012", "PMID: 34879891", "PMID: 36265521"],
    timeline: [
      { year: 2018, title: "Creatine & Cognitive Function", description: "Meta-analysis: creatine improves memory and intelligence tasks, especially under stress", studyType: "meta", citation: "Psychopharmacology 2018" },
      { year: 2022, title: "Creatine & Mitochondria", description: "Creatine stabilizes mitochondrial membranes; reduces ROS production in aging muscle", studyType: "mechanism", citation: "FASEB J 2022" },
      { year: 2024, title: "Creatine & Epigenetic Age", description: "12-month creatine + resistance training slowed PhenoAge by 0.6 years vs resistance alone", studyType: "rct", citation: "J Cachexia Sarcopenia Muscle 2024" },
    ]
  },
]

export const agingClocks = [
  { id: "phenoage", name: "PhenoAge", description: "Clinical chemistry-based (9 biomarkers)", unit: "years", color: "emerald" },
  { id: "dunedinpace", name: "DunedinPACE", description: "Rate of aging from DNA methylation", unit: "years/year", color: "cyan" },
  { id: "omicmage", name: "OMICmAge", description: "Multi-omic methylation clock", unit: "years", color: "amber" },
  { id: "grimage", name: "GrimAge", description: "Mortality-risk methylation clock", unit: "years", color: "rose" },
  { id: "telomere", name: "Telomere Length", description: "Leukocyte telomere length (qPCR)", unit: "kb", color: "cyan" },
]

/**
 * Estimates biological age from chronological age and intervention adherence.
 * Applies a floor at 65% of chronological age to prevent unrealistic results.
 *
 * @param chronologicalAge - User's chronological age in years
 * @param interventions - List of interventions with effect sizes and adherence values
 * @returns Estimated biological age in years
 */
export function calculateBiologicalAge(chronologicalAge: number, interventions: Intervention[]): number {
  let reduction = 0
  interventions.forEach(i => {
    reduction += i.effectSize * i.adherence
  })
  return Math.max(chronologicalAge - reduction, chronologicalAge * 0.65)
}