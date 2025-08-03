export enum CSSUnit {
    REM = 'rem',
    PX = 'px',
    EM = 'em',
}

export enum RootFontSize {
    STANDARD = '100',
    SIMPLIFIED = '62.5',
}

export interface ClampConfig {
    rootFontSize: RootFontSize
    minDevice: number
    maxDevice: number
    minValue: string
    maxValue: string
    unit: CSSUnit
    convertToRem: boolean
}

export interface ParsedValue {
    number: number
    unit: CSSUnit
}

export interface ClampCalculationResult {
    isValid: boolean
    result: string
    errorMessage?: string
    details?: {
        slope: number
        yIntercept: number
        vwCoefficient: number
    }
}

// Validation types
export interface ValidationErrors {
    minDevice?: string
    maxDevice?: string
    minValue?: string
    maxValue?: string
}

export interface ValidationRule<T = any> {
    validate: (value: T, context?: any) => string | null
    message?: string
}

export interface ValidationSchema {
    [key: string]: ValidationRule[]
}

// Error types
export class ClampCalculationError extends Error {
    constructor(
        message: string,
        public code: string,
    ) {
        super(message)
        this.name = 'ClampCalculationError'
    }
}

// Constants
export const VALIDATION_PATTERNS = {
    NUMERIC_VALUE: /^-?\d*\.?\d+$/,
    CSS_VALUE: /^(-?\d*\.?\d+)(rem|px|em|%)$/,
} as const

export const CALCULATION_LIMITS = {
    MIN_VALUE_RANGE: -1000,
    MAX_VALUE_RANGE: 1000,
    DECIMAL_PRECISION: 3,
} as const
