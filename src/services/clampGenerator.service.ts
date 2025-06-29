import { CSSUnit, type ClampConfig, type ParsedValue } from '../types/clamp.types'
import { NumberFormatterService } from './numberFormatter.service'

export class ClampGeneratorService {
    static generateClampFunction(
        config: ClampConfig,
        minVal: ParsedValue,
        maxVal: ParsedValue,
        minPx: number,
        maxPx: number,
        baseFontSize: number,
    ): string {
        // Calculate linear function coefficients
        const slope = (maxPx - minPx) / (config.maxDevice - config.minDevice)
        const yIntercept = minPx - slope * config.minDevice

        // Calculate vw coefficient
        const vwCoefficient = slope * 100

        // Convert y-intercept to original units
        let yInterceptInUnits: number
        if (minVal.unit === CSSUnit.REM || minVal.unit === CSSUnit.EM) {
            yInterceptInUnits = yIntercept / baseFontSize
        } else {
            yInterceptInUnits = yIntercept
        }

        // Format the clamp function
        const vwValue = NumberFormatterService.formatNumber(vwCoefficient)
        const constantValue = NumberFormatterService.formatNumber(Math.abs(yInterceptInUnits))
        const constantUnit = minVal.unit === CSSUnit.EM ? CSSUnit.REM : minVal.unit
        const sign = yInterceptInUnits >= 0 ? '+' : '-'

        const minFormatted = NumberFormatterService.formatCssValue(minVal.number, minVal.unit)
        const maxFormatted = NumberFormatterService.formatCssValue(maxVal.number, maxVal.unit)

        return `clamp(${minFormatted}, ${vwValue}vw ${sign} ${constantValue}${constantUnit}, ${maxFormatted})`
    }
}
