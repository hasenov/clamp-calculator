import type { RadioOption } from '../types/ui.types'

export const ROOT_FONT_SIZE_OPTIONS: RadioOption[] = [
    {
        value: '100',
        label: '100% (16px)',
        description: 'Default browser size',
    },
    {
        value: '62.5',
        label: '62.5% (10px)',
        description: 'Simplified rem calculation (1rem = 10px)',
    },
] as const

/**
 * Device width limits for clamp functions
 * Note: These limits apply only to UI validation for manual input.
 * Parsing uses absolute bounds (100px - 10000px).
 */
export const DEVICE_WIDTH_LIMITS = {
    MIN_DEVICE: {
        min: 100, // Mobile device minimum width
        max: 2000, // Maximum width for min device
        default: 320, // Standard mobile width
    },
    MAX_DEVICE: {
        min: 400, // Minimum width for max device
        max: 10000, // Maximum device width (large screens)
        default: 1366, // Standard desktop width
    },
} as const

export const INPUT_PLACEHOLDERS = {
    MIN_VALUE_REM: '1',
    MAX_VALUE_REM: '2.5',
    MIN_VALUE_EM: '1',
    MAX_VALUE_EM: '2.5',
    MIN_VALUE_PX: '16',
    MAX_VALUE_PX: '40',
} as const

export const INPUT_HELPERS = {
    ROOT_FONT_SIZE: 'Base font size for rem unit calculations',
    MIN_DEVICE: 'Minimum screen width (px)',
    MAX_DEVICE: 'Maximum screen width (px)',
} as const

export const BUTTON_LABELS = {
    RESET: 'Reset All',
} as const
