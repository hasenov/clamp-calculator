import type { ClampConfig, ParsedValue } from '../types/clamp.types'
import { CSSUnit, RootFontSize } from '../types/clamp.types'
import { ValueParserService } from './valueParser.service'
import { UnitConverterService } from './unitConverter.service'
import { LoggerService } from './logger.service'
import { DEVICE_WIDTH_LIMITS } from '../constants/ui.constants'

export interface ParsedClampFunction {
    isValid: boolean
    config?: Partial<ClampConfig>
    errorMessage?: string
}

export class ClampParserService {
    private static readonly CLAMP_PATTERN = /^clamp\(\s*([^,]+),\s*([^,]+),\s*([^)]+)\s*\)$/i

    static parseClampFunction(
        clampString: string,
        rootFontSize: RootFontSize,
    ): ParsedClampFunction {
        try {
            LoggerService.debug('Starting clamp function parsing', 'ClampParser', {
                clampString,
                rootFontSize,
            })

            const trimmed = clampString.trim()
            const match = trimmed.match(this.CLAMP_PATTERN)

            if (!match) {
                LoggerService.warn('Invalid clamp function format', 'ClampParser', { clampString })
                return {
                    isValid: false,
                    errorMessage: 'Invalid clamp() function format',
                }
            }

            const [, minPart, preferredPart, maxPart] = match

            const minValue = this.parseValuePart(minPart.trim())
            const maxValue = this.parseValuePart(maxPart.trim())

            if (!minValue || !maxValue) {
                LoggerService.warn('Unable to parse min/max values', 'ClampParser', {
                    minPart,
                    maxPart,
                })
                return {
                    isValid: false,
                    errorMessage: 'Unable to parse min/max values',
                }
            }

            const preferredMatch = preferredPart
                .trim()
                .match(/^(-?\d*\.?\d+)vw\s*([-+])\s*(-?\d*\.?\d+)(\w+)$/)

            if (!preferredMatch) {
                LoggerService.warn('Unable to parse preferred value', 'ClampParser', {
                    preferredPart,
                })
                return {
                    isValid: false,
                    errorMessage: 'Unable to parse preferred value (expected format: Xvw ± Yunit)',
                }
            }

            const [, vwCoeff, sign, constant, constantUnit] = preferredMatch
            const vwCoefficient = parseFloat(vwCoeff)
            const constantValue = parseFloat(constant) * (sign === '-' ? -1 : 1)

            if (minValue.unit !== maxValue.unit) {
                LoggerService.warn('Min and max values use different units', 'ClampParser', {
                    minUnit: minValue.unit,
                    maxUnit: maxValue.unit,
                })
                return {
                    isValid: false,
                    errorMessage: 'Min and max values must use the same unit',
                }
            }

            const { minDevice, maxDevice } = this.calculateDeviceWidths(
                minValue,
                maxValue,
                vwCoefficient,
                constantValue,
                constantUnit as CSSUnit,
                rootFontSize,
            )

            LoggerService.debug('Calculated device widths', 'ClampParser', {
                minDevice,
                maxDevice,
                vwCoefficient,
                constantValue,
                constantUnit,
            })

            if (minDevice >= maxDevice) {
                LoggerService.warn('Min device width >= Max device width', 'ClampParser', {
                    minDevice,
                    maxDevice,
                })
                return {
                    isValid: false,
                    errorMessage: 'Min device width must be less than max device width',
                }
            }

            // Check absolute bounds for parsing (UI validation applies later)
            if (
                minDevice < DEVICE_WIDTH_LIMITS.MIN_DEVICE.min ||
                maxDevice > DEVICE_WIDTH_LIMITS.MAX_DEVICE.max
            ) {
                LoggerService.warn(
                    'Calculated device widths are outside reasonable range',
                    'ClampParser',
                    {
                        minDevice,
                        maxDevice,
                        limits: {
                            minAllowed: DEVICE_WIDTH_LIMITS.MIN_DEVICE.min,
                            maxAllowed: DEVICE_WIDTH_LIMITS.MAX_DEVICE.max,
                        },
                    },
                )
                return {
                    isValid: false,
                    errorMessage: `Calculated device widths are outside reasonable range (${DEVICE_WIDTH_LIMITS.MIN_DEVICE.min}px - ${DEVICE_WIDTH_LIMITS.MAX_DEVICE.max}px)`,
                }
            }

            // Round values for better UX
            const roundedMinValue = Math.round(minValue.number * 1000) / 1000
            const roundedMaxValue = Math.round(maxValue.number * 1000) / 1000

            const result = {
                isValid: true,
                config: {
                    rootFontSize,
                    minDevice,
                    maxDevice,
                    minValue: roundedMinValue.toString(),
                    maxValue: roundedMaxValue.toString(),
                    unit: minValue.unit,
                    convertToRem: false,
                },
            }

            LoggerService.info('Clamp function parsed successfully', 'ClampParser', {
                ...result.config,
                originalMinValue: minValue.number,
                originalMaxValue: maxValue.number,
                roundedMinValue,
                roundedMaxValue,
            })
            return result
        } catch (error) {
            LoggerService.error('Clamp parsing error', 'ClampParser', error)
            return {
                isValid: false,
                errorMessage: 'Parsing error occurred',
            }
        }
    }

    private static calculateDeviceWidths(
        minValue: ParsedValue,
        maxValue: ParsedValue,
        vwCoefficient: number,
        constantValue: number,
        constantUnit: CSSUnit,
        rootFontSize: RootFontSize,
    ): { minDevice: number; maxDevice: number } {
        const baseFontSize = UnitConverterService.getBaseFontSize(rootFontSize)
        const minPx = UnitConverterService.convertToPixels(
            minValue.number,
            minValue.unit,
            baseFontSize,
        )
        const maxPx = UnitConverterService.convertToPixels(
            maxValue.number,
            maxValue.unit,
            baseFontSize,
        )
        const constantPx =
            UnitConverterService.convertToPixels(
                Math.abs(constantValue),
                constantUnit,
                baseFontSize,
            ) * Math.sign(constantValue)

        // Calculate device widths: minPx = vwCoefficient * minDevice + constantPx
        const minDevice = (minPx - constantPx) / (vwCoefficient / 100)
        const maxDevice = (maxPx - constantPx) / (vwCoefficient / 100)

        // Round for UI display
        const roundedMinDevice = Math.round(minDevice)
        const roundedMaxDevice = Math.round(maxDevice)

        LoggerService.debug('Device width calculation details', 'ClampParser', {
            minPx,
            maxPx,
            constantPx,
            vwCoefficient,
            vwCoefficientDiv100: vwCoefficient / 100,
            minDevice,
            maxDevice,
            roundedMinDevice,
            roundedMaxDevice,
        })

        return { minDevice: roundedMinDevice, maxDevice: roundedMaxDevice }
    }

    private static parseValuePart(part: string): ParsedValue | null {
        const trimmed = part.trim()

        const parsed = ValueParserService.parseValue(trimmed)
        if (parsed) {
            return parsed
        }

        const num = ValueParserService.parseNumericValue(trimmed)
        if (num !== null) {
            return {
                number: num,
                unit: CSSUnit.PX,
            }
        }

        return null
    }

    static isClampFunction(input: string): boolean {
        const trimmed = input.trim()
        return this.CLAMP_PATTERN.test(trimmed)
    }
}
