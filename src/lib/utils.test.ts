import { describe, it, expect } from "vitest"
import {
  calculateBiologicalAge,
  formatNumber,
  getCategoryColor,
  sanitizeHtml,
  isValidNumber,
  interventionDatabase,
} from "./utils"

describe("calculateBiologicalAge", () => {
  it("should return chronological age when no interventions", () => {
    expect(calculateBiologicalAge(40, [])).toBe(40)
  })

  it("should reduce age based on intervention effect and adherence", () => {
    const interventions = [
      { id: "test", effectSize: 2, adherence: 0.5 } as const,
    ]
    expect(calculateBiologicalAge(40, interventions as any)).toBe(39)
  })

  it("should floor at 65% of chronological age", () => {
    const interventions = [
      { id: "a", effectSize: 50, adherence: 1 } as const,
      { id: "b", effectSize: 50, adherence: 1 } as const,
    ]
    expect(calculateBiologicalAge(40, interventions as any)).toBe(26)
  })
})

describe("formatNumber", () => {
  it("should format small numbers with decimals", () => {
    expect(formatNumber(42.5)).toBe("42.5")
    expect(formatNumber(42)).toBe("42")
  })

  it("should format thousands with K suffix", () => {
    expect(formatNumber(1500)).toBe("1.5K")
  })

  it("should format millions with M suffix", () => {
    expect(formatNumber(2500000)).toBe("2.5M")
  })
})

describe("getCategoryColor", () => {
  it("should return known colors for each category", () => {
    expect(getCategoryColor("supplement")).toBe("#00d97e")
    expect(getCategoryColor("exercise")).toBe("#06b6d4")
    expect(getCategoryColor("diet")).toBe("#fbbf24")
    expect(getCategoryColor("sleep")).toBe("#06b6d4")
    expect(getCategoryColor("drug")).toBe("#f43f5e")
    expect(getCategoryColor("behavioral")).toBe("#fbbf24")
  })

  it("should fallback to emerald for unknown category", () => {
    expect(getCategoryColor("unknown" as any)).toBe("#00d97e")
  })
})

describe("sanitizeHtml", () => {
  it("should escape HTML entities", () => {
    expect(sanitizeHtml("<script>alert('xss')</script>")).toBe(
      "&lt;script&gt;alert(&#039;xss&#039;)&lt;/script&gt;"
    )
  })

  it("should escape ampersands", () => {
    expect(sanitizeHtml("rock & roll")).toBe("rock &amp; roll")
  })

  it("should return empty string for empty input", () => {
    expect(sanitizeHtml("")).toBe("")
  })
})

describe("isValidNumber", () => {
  it("should validate finite numbers", () => {
    expect(isValidNumber(42)).toBe(true)
    expect(isValidNumber(3.14)).toBe(true)
  })

  it("should reject non-numbers", () => {
    expect(isValidNumber("42")).toBe(false)
    expect(isValidNumber(NaN)).toBe(false)
    expect(isValidNumber(Infinity)).toBe(false)
    expect(isValidNumber(null)).toBe(false)
    expect(isValidNumber(undefined)).toBe(false)
  })

  it("should enforce min/max range", () => {
    expect(isValidNumber(5, 1, 10)).toBe(true)
    expect(isValidNumber(0, 1, 10)).toBe(false)
    expect(isValidNumber(11, 1, 10)).toBe(false)
  })
})

describe("interventionDatabase", () => {
  it("should have exactly 12 interventions", () => {
    expect(interventionDatabase).toHaveLength(12)
  })

  it("should have unique IDs", () => {
    const ids = interventionDatabase.map(i => i.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("should have valid evidence levels", () => {
    const validLevels = new Set(["strong", "moderate", "emerging"])
    interventionDatabase.forEach(i => {
      expect(validLevels.has(i.evidenceLevel)).toBe(true)
    })
  })

  it("should have confidence between 0 and 1", () => {
    interventionDatabase.forEach(i => {
      expect(i.confidence).toBeGreaterThanOrEqual(0)
      expect(i.confidence).toBeLessThanOrEqual(1)
    })
  })

  it("should have effectSize greater than 0", () => {
    interventionDatabase.forEach(i => {
      expect(i.effectSize).toBeGreaterThan(0)
    })
  })
})
