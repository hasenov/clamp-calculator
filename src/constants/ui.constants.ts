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

export const DEVICE_WIDTH_LIMITS = {
    MIN_DEVICE: {
        min: 200,
        max: 1200,
        default: 320,
    },
    MAX_DEVICE: {
        min: 800,
        max: 5000,
        default: 1366,
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
