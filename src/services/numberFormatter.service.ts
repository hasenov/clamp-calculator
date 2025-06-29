import { CALCULATION_LIMITS } from '../types/clamp.types'

export class NumberFormatterService {
    static formatNumber(num: number, precision = CALCULATION_LIMITS.DECIMAL_PRECISION): string {
        if (!isFinite(num)) {
            return '0'
        }

        // Round to specified decimal places to avoid floating point precision issues
        const multiplier = Math.pow(10, precision)
        const rounded = Math.round(num * multiplier) / multiplier

        // Convert to string and remove trailing zeros
        return rounded.toString().replace(/\.?0+$/, '')
    }

    static formatCssValue(value: number, unit: string): string {
        return `${this.formatNumber(value)}${unit}`
    }
}
