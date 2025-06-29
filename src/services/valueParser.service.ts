import { CSSUnit, type ParsedValue, VALIDATION_PATTERNS } from '../types/clamp.types'

export class ValueParserService {
    static parseValue(value: string): ParsedValue | null {
        const trimmed = value.trim()
        const match = trimmed.match(VALIDATION_PATTERNS.CSS_VALUE)

        if (!match) return null

        const unit = match[2] as CSSUnit
        if (!Object.values(CSSUnit).includes(unit)) {
            return null
        }

        return {
            number: parseFloat(match[1]),
            unit,
        }
    }

    static parseNumericValue(value: string): number | null {
        const trimmed = value.trim()
        if (!VALIDATION_PATTERNS.NUMERIC_VALUE.test(trimmed)) {
            return null
        }

        const num = parseFloat(trimmed)
        return isNaN(num) ? null : num
    }

    static validateNumericRange(value: number, min: number, max: number): boolean {
        return value >= min && value <= max
    }
}
