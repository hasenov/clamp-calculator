import { computed, watch, type ComputedRef } from 'vue'
import type { ClampConfig, ValidationErrors } from '../types/clamp.types'
import { useValidation } from './useValidation'
import { clampValidationSchema } from '../validation/clamp.validation'
import { ClampCalculatorService } from '../services/clampCalculator.service'
import { ClampParserService } from '@/services/clampParser.service'
import { LoggerService } from '../services/logger.service'

export interface ClampCalculatorReturn {
    errors: Readonly<ValidationErrors>
    hasErrors: ComputedRef<boolean>
    clampResult: ComputedRef<string>
    resetToDefaults: () => void
    parseClampFunction: (clampString: string) => void
}

export function useClampCalculator(config: ClampConfig): ClampCalculatorReturn {
    LoggerService.debug('Initializing clamp calculator', 'ClampCalculator')

    // Create reactive object with only validatable fields
    const validatableConfig = computed(() => ({
        minDevice: config.minDevice,
        maxDevice: config.maxDevice,
        minValue: config.minValue,
        maxValue: config.maxValue,
    }))

    // Use validation composable for validatable fields only
    const { errors, hasErrors, validate } = useValidation(
        validatableConfig,
        clampValidationSchema,
        {
            immediate: true,
            debounceMs: 300,
            context: 'ClampCalculator',
        },
    )

    // Computed clamp result with memoization
    const clampResult = computed(() => {
        if (hasErrors.value) {
            LoggerService.debug(
                'Validation errors present, returning error message',
                'ClampCalculator',
                { errors: Object.keys(errors) },
            )
            return 'Please fix the errors above'
        }

        try {
            LoggerService.debug('Calculating clamp result', 'ClampCalculator', config)
            const calculation = ClampCalculatorService.calculateClamp(config)

            if (calculation.isValid) {
                LoggerService.info('Clamp calculation successful', 'ClampCalculator', {
                    result: calculation.result,
                })
            } else {
                LoggerService.warn('Clamp calculation failed', 'ClampCalculator', {
                    error: calculation.errorMessage,
                })
            }

            return calculation.result
        } catch (error) {
            LoggerService.error('Clamp calculation failed', 'ClampCalculator', error)
            return 'Calculation error occurred'
        }
    })

    // Reset to default values
    const resetToDefaults = (): void => {
        LoggerService.info('Resetting calculator to defaults', 'ClampCalculator')
        const defaultConfig = ClampCalculatorService.getDefaultConfig()
        Object.assign(config, defaultConfig)
    }

    // Watch for configuration changes and re-validate
    watch(
        validatableConfig,
        () => {
            LoggerService.debug('Configuration changed, re-validating', 'ClampCalculator')
            validate()
        },
        { deep: true },
    )

    const parseClampFunction = (clampString: string): void => {
        LoggerService.info('Parsing clamp function', 'ClampCalculator', { clampString })

        const result = ClampParserService.parseClampFunction(clampString, config.rootFontSize)

        if (result.isValid && result.config) {
            LoggerService.info(
                'Clamp function parsed successfully',
                'ClampCalculator',
                result.config,
            )
            // Update config with parsed values while preserving current rootFontSize
            Object.assign(config, {
                ...result.config,
                rootFontSize: config.rootFontSize,
            })
        } else {
            LoggerService.error('Failed to parse clamp function', 'ClampCalculator', {
                error: result.errorMessage,
                clampString,
            })
        }
    }

    return {
        errors,
        hasErrors,
        clampResult,
        resetToDefaults,
        parseClampFunction,
    }
}
