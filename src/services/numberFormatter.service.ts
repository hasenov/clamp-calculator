import { CALCULATION_LIMITS } from '../types/clamp.types'

export class NumberFormatterService {
    static formatNumber(num: number, precision = CALCULATION_LIMITS.DECIMAL_PRECISION): string {
        if (!isFinite(num)) {
            return '0'
        }
        const multiplier = Math.pow(10, precision)
        const rounded = Math.round(num * multiplier) / multiplier

        if (Number.isInteger(rounded)) {
            return rounded.toString()
        }

        return rounded
            .toString()
            .replace(/(\.\d*?[1-9])0+$/, '$1')
            .replace(/\.0+$/, '')
    }

    static formatCssValue(value: number, unit: string): string {
        return `${this.formatNumber(value)}${unit}`
    }
}
