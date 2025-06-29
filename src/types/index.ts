// Main types re-export
export type {
    ClampConfig,
    ClampCalculationResult,
    ParsedValue,
    ValidationErrors,
    ValidationRule,
    ValidationSchema,
} from './clamp.types'

// Enums export (not as types)
export {
    RootFontSize,
    CSSUnit,
    ClampCalculationError,
    VALIDATION_PATTERNS,
    CALCULATION_LIMITS,
} from './clamp.types'

// UI types re-export
export type {
    RadioOption,
    InputField,
    ButtonVariant,
    SectionVariant,
    BaseComponentProps,
    FormComponentProps,
    InputEmits,
    ButtonEmits,
    RadioGroupEmits,
} from './ui.types'
