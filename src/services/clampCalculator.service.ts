import type { ClampConfig, ClampCalculationResult, ParsedValue } from '../types/clamp.types'
import { CSSUnit, RootFontSize } from '../types/clamp.types'
import { ValueParserService } from './valueParser.service'
import { UnitConverterService } from './unitConverter.service'
import { ClampGeneratorService } from './clampGenerator.service'
import { LoggerService } from './logger.service'

export class ClampCalculatorService {
    static calculateClamp(config: ClampConfig): ClampCalculationResult {
        try {
            LoggerService.debug('Starting clamp calculation', 'ClampCalculator', config)

            if (!this.validateRequiredFields(config)) {
                return this.createErrorResult('Required fields are missing')
            }

            const result = this.calculateClampWithUnitSelection(config)
            LoggerService.info('Clamp calculation completed successfully', 'ClampCalculator', {
                result: result.result,
            })
            return result
        } catch (error) {
            LoggerService.error('Clamp calculation error', 'ClampCalculator', error)
            return this.createErrorResult('Calculation error occurred')
        }
    }

    private static validateRequiredFields(config: ClampConfig): boolean {
        if (!config.minValue || !config.maxValue) {
            LoggerService.warn('Missing required values', 'ClampCalculator', {
                minValue: config.minValue,
                maxValue: config.maxValue,
            })
            return false
        }

        if (!config.unit) {
            LoggerService.warn('Missing unit specification', 'ClampCalculator', {
                unit: config.unit,
            })
            return false
        }

        return true
    }

    private static calculateClampWithUnitSelection(config: ClampConfig): ClampCalculationResult {
        const minNum = ValueParserService.parseNumericValue(config.minValue)
        const maxNum = ValueParserService.parseNumericValue(config.maxValue)

        if (minNum === null || maxNum === null) {
            LoggerService.warn('Invalid numeric values', 'ClampCalculator', {
                minValue: config.minValue,
                maxValue: config.maxValue,
            })
            return this.createErrorResult('Invalid numeric values')
        }

        if (minNum >= maxNum) {
            LoggerService.warn('Min value >= Max value', 'ClampCalculator', { minNum, maxNum })
            return this.createErrorResult('Minimum value must be less than maximum value')
        }

        const { outputUnit, minValue, maxValue } = this.processUnitConversion(
            config,
            minNum,
            maxNum,
        )

        const minVal: ParsedValue = { number: minValue, unit: outputUnit }
        const maxVal: ParsedValue = { number: maxValue, unit: outputUnit }

        const baseFontSize = UnitConverterService.getBaseFontSize(config.rootFontSize)
        const minPx = UnitConverterService.convertToPixels(minValue, outputUnit, baseFontSize)
        const maxPx = UnitConverterService.convertToPixels(maxValue, outputUnit, baseFontSize)

        const clampFunction = ClampGeneratorService.generateClampFunction(
            config,
            minVal,
            maxVal,
            minPx,
            maxPx,
            baseFontSize,
        )

        return {
            isValid: true,
            result: clampFunction,
        }
    }

    private static processUnitConversion(
        config: ClampConfig,
        minNum: number,
        maxNum: number,
    ): { outputUnit: CSSUnit; minValue: number; maxValue: number } {
        let outputUnit = config.unit!
        let minValue = minNum
        let maxValue = maxNum

        if (config.unit === CSSUnit.PX && config.convertToRem) {
            outputUnit = CSSUnit.REM
            minValue = UnitConverterService.convertPxToRem(minNum, config.rootFontSize)
            maxValue = UnitConverterService.convertPxToRem(maxNum, config.rootFontSize)
            LoggerService.debug('Converted px to rem', 'ClampCalculator', {
                original: { minNum, maxNum },
                converted: { minValue, maxValue },
            })
        }

        return { outputUnit, minValue, maxValue }
    }

    private static createErrorResult(message: string): ClampCalculationResult {
        return {
            isValid: false,
            result: 'clamp(min, preferred, max)',
            errorMessage: message,
        }
    }

    static getDefaultConfig(): ClampConfig {
        return {
            rootFontSize: RootFontSize.STANDARD,
            minDevice: 320,
            maxDevice: 1366,
            minValue: '',
            maxValue: '',
            unit: CSSUnit.REM,
            convertToRem: false,
        }
    }
}
