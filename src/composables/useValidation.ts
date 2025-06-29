import { reactive, computed, watch, readonly, type Ref, onUnmounted } from 'vue'
import type { ValidationErrors, ValidationRule, ValidationSchema } from '../types/clamp.types'
import { LoggerService } from '../services/logger.service'

export interface UseValidationOptions {
    immediate?: boolean
    debounceMs?: number
    context?: string
}

export function useValidation<T extends Record<string, any>>(
    data: T | Ref<T>,
    schema: ValidationSchema,
    options: UseValidationOptions = {},
) {
    const { immediate = true, debounceMs = 0, context = 'Validation' } = options

    const errors = reactive<ValidationErrors>({})
    let debounceTimer: ReturnType<typeof setTimeout> | null = null

    const validate = (fieldName?: string): boolean => {
        const dataValue = 'value' in data ? data.value : data
        const newErrors: ValidationErrors = {}

        const fieldsToValidate = fieldName ? [fieldName] : Object.keys(schema)

        LoggerService.debug(`Validating ${fieldName || 'all fields'}`, context, {
            fieldsToValidate,
        })

        fieldsToValidate.forEach((field) => {
            const rules = schema[field]
            if (!rules) {
                LoggerService.warn(`No validation rules found for field: ${field}`, context)
                return
            }

            for (const rule of rules) {
                try {
                    const error = rule.validate(dataValue[field], dataValue)
                    if (error) {
                        newErrors[field as keyof ValidationErrors] = error
                        LoggerService.debug(`Validation failed for field: ${field}`, context, {
                            value: dataValue[field],
                            error,
                            rule: rule.message || 'Custom rule',
                        })
                        break
                    }
                } catch (validationError) {
                    LoggerService.error(
                        `Validation error for field ${field}`,
                        context,
                        validationError,
                    )
                    newErrors[field as keyof ValidationErrors] = 'Validation failed'
                    break
                }
            }
        })

        updateErrors(newErrors, fieldName)

        const hasNoErrors = fieldName
            ? !newErrors[fieldName as keyof ValidationErrors]
            : Object.keys(newErrors).length === 0

        LoggerService.debug(`Validation completed for ${fieldName || 'all fields'}`, context, {
            hasErrors: !hasNoErrors,
            errorCount: Object.keys(newErrors).length,
        })

        return hasNoErrors
    }

    const updateErrors = (newErrors: ValidationErrors, fieldName?: string): void => {
        if (fieldName) {
            const fieldError = newErrors[fieldName as keyof ValidationErrors]
            if (fieldError) {
                errors[fieldName as keyof ValidationErrors] = fieldError
            } else {
                delete errors[fieldName as keyof ValidationErrors]
            }
        } else {
            Object.keys(errors).forEach((key) => delete errors[key as keyof ValidationErrors])
            Object.assign(errors, newErrors)
        }
    }

    const validateField = (fieldName: string): boolean => validate(fieldName)

    const validateAll = (): boolean => validate()

    const clearErrors = (fieldName?: string): void => {
        if (fieldName) {
            delete errors[fieldName as keyof ValidationErrors]
            LoggerService.debug(`Cleared errors for field: ${fieldName}`, context)
        } else {
            Object.keys(errors).forEach((key) => delete errors[key as keyof ValidationErrors])
            LoggerService.debug('Cleared all validation errors', context)
        }
    }

    const hasErrors = computed(() => Object.keys(errors).length > 0)

    const getFieldError = (fieldName: string): string | undefined => {
        return errors[fieldName as keyof ValidationErrors]
    }

    const debouncedValidate = (fieldName?: string) => {
        if (debounceTimer !== null) {
            clearTimeout(debounceTimer)
        }

        debounceTimer = setTimeout(() => {
            validate(fieldName)
            debounceTimer = null
        }, debounceMs)
    }

    const cleanup = () => {
        if (debounceTimer !== null) {
            clearTimeout(debounceTimer)
            debounceTimer = null
        }
        LoggerService.debug('Validation composable cleanup completed', context)
    }

    if (immediate) {
        watch(
            data,
            () => {
                if (debounceMs > 0) {
                    debouncedValidate()
                } else {
                    validate()
                }
            },
            { deep: true },
        )
    }

    onUnmounted(cleanup)

    return {
        errors: readonly(errors),
        hasErrors,
        validate: validateAll,
        validateField,
        clearErrors,
        getFieldError,
        cleanup,
    }
}

// Validation rule factories
export const createValidationRules = () => {
    const required = (message = 'Field is required'): ValidationRule => ({
        validate: (value: any) => {
            if (value === null || value === undefined || value === '') {
                return message
            }
            return null
        },
    })

    const min = (minValue: number, message?: string): ValidationRule => ({
        validate: (value: number) => {
            if (typeof value !== 'number' || isNaN(value) || value < minValue) {
                return message || `Value must be at least ${minValue}`
            }
            return null
        },
    })

    const max = (maxValue: number, message?: string): ValidationRule => ({
        validate: (value: number) => {
            if (typeof value !== 'number' || isNaN(value) || value > maxValue) {
                return message || `Value must be at most ${maxValue}`
            }
            return null
        },
    })

    const range = (minValue: number, maxValue: number, message?: string): ValidationRule => ({
        validate: (value: number) => {
            if (typeof value !== 'number' || isNaN(value) || value < minValue || value > maxValue) {
                return message || `Value must be between ${minValue} and ${maxValue}`
            }
            return null
        },
    })

    const pattern = (regex: RegExp, message = 'Invalid format'): ValidationRule => ({
        validate: (value: string) => {
            if (typeof value !== 'string' || !regex.test(value)) {
                return message
            }
            return null
        },
    })

    const custom = (
        validator: (value: any, context?: any) => boolean,
        message: string,
    ): ValidationRule => ({
        validate: (value: any, context?: any) => {
            return validator(value, context) ? null : message
        },
    })

    return {
        required,
        min,
        max,
        range,
        pattern,
        custom,
    }
}
