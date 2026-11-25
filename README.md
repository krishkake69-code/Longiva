# Longiva — Personalized Longevity Engine

Longiva is a production-ready frontend for an AI-powered personalized longevity platform built for the BUILD 2036 hackathon in the Health, Longevity & Biotechnology track. The application guides users through an 8-step health assessment covering 50+ biomarkers and generates a personalized intervention protocol using causal inference and multi-omic aging clocks.

## Features

### Assessment
- 8-step wizard covering demographics, blood work, hormones, organ function, body composition, epigenetic clocks, lifestyle, and medications
- 50+ biomarker fields with Zod schema validation
- Demo profiles for instant testing (Optimal 40yo, Average 50yo, High Risk 60yo)
- Controlled form state with React Hook Form

### Results Dashboard
- 5-tab interface: Overview, Interventions, Biomarkers, Simulation, Evidence
- Biological age calculation vs chronological age
- 12 evidence-graded interventions with timelines and adherence sliders
- Real-time biological age simulation across 5-30 year horizons
- What-if scenario modeling (add intervention, perfect adherence, drop lowest adherence)
- Evidence timelines with RCT, meta-analysis, Mendelian randomization, and mechanism studies

### Design
- Light theme default for readability
- OKLCH color system
- 3-tier glass morphism
- Fluid typography with clamp() scales
- Framer Motion animations
- Responsive layout

## Tech Stack

- Next.js 14 (App Router)
- TypeScript (strict mode)
- Tailwind CSS v4
- Radix UI primitives (Button, Input, Label, Card, Select, Slider, Tabs, Progress, Tooltip, Separator, Collapsible, NavigationMenu)
- Framer Motion
- Recharts
- React Hook Form
- Zod
- Vitest (testing)

## Project Structure

```
longiva-v4/
├── src/
│   ├── app/
│   │   ├── globals.css        # Design system (OKLCH, glass morphism, motion tokens)
│   │   ├── layout.tsx
│   │   └── page.tsx           # Main composition
│   ├── components/
│   │   ├── Navigation.tsx     # Hero, methodology, footer, sticky glass nav
│   │   ├── AssessmentForm.tsx # 8-step wizard with validation
│   │   ├── ResultsDashboard.tsx # 5-tab dashboard with Recharts
│   │   └── HeroBackground.tsx # CSS ambient background
│   ├── components/ui/         # 12 Radix UI primitives
│   └── lib/
│       └── utils.ts           # Intervention database, types, calculations
├── vitest.config.ts
├── package.json
├── next.config.ts
└── README.md
```

## Installation

```bash
git clone https://github.com/krishkake69-code/Longiva.git
cd Longiva
npm install
npm run dev
```

The development server runs at http://localhost:3000.

## Commands

```bash
npm run dev      # Start development server (Turbopack)
npm run build    # Production build
npm run start    # Production server
npm run lint     # Run ESLint
npm run test     # Run Vitest test suite
npm run test:watch # Watch mode for tests
```

## Security

- Content Security Policy headers configured in next.config.ts
- X-Frame-Options set to DENY to prevent clickjacking
- X-Content-Type-Options set to nosniff
- Referrer-Policy set to strict-origin-when-cross-origin
- Permissions-Policy restricts camera, microphone, geolocation, and payment APIs
- Input sanitization applied to text fields on form submission (XSS defense in depth)
- No secrets or API keys hardcoded in frontend code

## Testing

The project includes 19 unit tests covering utility functions:

- calculateBiologicalAge (floor logic, effect calculation, no-intervention case)
- formatNumber (small numbers, K suffix, M suffix)
- getCategoryColor (category mapping, fallback)
- sanitizeHtml (XSS escaping, ampersands, empty input)
- isValidNumber (finite numbers, non-numbers, range validation)
- interventionDatabase (12 interventions, unique IDs, valid evidence levels, confidence bounds)

Run tests with:
```bash
npm run test
```

## Intervention Database

12 evidence-graded interventions across 6 categories:

| Category | Interventions |
|----------|---------------|
| Supplement | Omega-3, Vitamin D3, Creatine |
| Exercise | Zone 2 Cardio, Resistance Training |
| Diet | Mediterranean Diet, Time-Restricted Eating |
| Sleep | Sleep Optimization |
| Drug | Metformin, Rapamycin |
| Behavioral | Meditation/Mindfulness, Sauna |

Each intervention includes effect size, confidence score, evidence level, cost, time commitment, contraindications, tracked biomarkers, and citation timeline.

## License

MIT