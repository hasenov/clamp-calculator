import type { ValidationSchema } from '../types/clamp.types'
import { createValidationRules } from '../composables/useValidation'
import { DEVICE_WIDTH_LIMITS } from '../constants/ui.constants'
import { VALIDATION_PATTERNS } from '../types/clamp.types'

const rules = createValidationRules()

export const clampValidationSchema: ValidationSchema = {
    minDevice: [
        rules.required('Minimum device width is required'),
        rules.range(
            DEVICE_WIDTH_LIMITS.MIN_DEVICE.min,
            DEVICE_WIDTH_LIMITS.MIN_DEVICE.max,
            `Value must be between ${DEVICE_WIDTH_LIMITS.MIN_DEVICE.min} and ${DEVICE_WIDTH_LIMITS.MIN_DEVICE.max} px`,
        ),
        rules.custom((value: number, context: any) => {
            return !context?.maxDevice || value < context.maxDevice
        }, 'Minimum width must be less than maximum width'),
    ],

    maxDevice: [
        rules.required('Maximum device width is required'),
        rules.range(
            DEVICE_WIDTH_LIMITS.MAX_DEVICE.min,
            DEVICE_WIDTH_LIMITS.MAX_DEVICE.max,
            `Value must be between ${DEVICE_WIDTH_LIMITS.MAX_DEVICE.min} and ${DEVICE_WIDTH_LIMITS.MAX_DEVICE.max} px`,
        ),
        rules.custom((value: number, context: any) => {
            return !context?.minDevice || value > context.minDevice
        }, 'Maximum width must be greater than minimum width'),
    ],

    minValue: [
        rules.required('Minimum value is required'),
        rules.pattern(
            VALIDATION_PATTERNS.NUMERIC_VALUE,
            'Must be a valid number (e.g., 1, 16, 2.5, -0.5)',
        ),
        rules.custom((value: string, context: any) => {
            if (!context?.maxValue) return true

            const minNum = parseFloat(value)
            const maxNum = parseFloat(context.maxValue)

            if (isNaN(minNum) || isNaN(maxNum)) return true

            return minNum < maxNum
        }, 'Minimum value must be less than maximum value'),
    ],

    maxValue: [
        rules.required('Maximum value is required'),
        rules.pattern(
            VALIDATION_PATTERNS.NUMERIC_VALUE,
            'Must be a valid number (e.g., 5, 80, 3.5, -1.2)',
        ),
        rules.custom((value: string, context: any) => {
            if (!context?.minValue) return true

            const minNum = parseFloat(context.minValue)
            const maxNum = parseFloat(value)

            if (isNaN(minNum) || isNaN(maxNum)) return true

            return maxNum > minNum
        }, 'Maximum value must be greater than minimum value'),
    ],
}
