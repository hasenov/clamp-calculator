export const ERROR_MESSAGES = {
    VALIDATION: {
        REQUIRED_FIELD: 'Field is required',
        INVALID_NUMBER: 'Must be a valid number',
        INVALID_FORMAT: 'Invalid format',
        MIN_VALUE: 'Value must be at least {min}',
        MAX_VALUE: 'Value must be at most {max}',
        RANGE: 'Value must be between {min} and {max}',
        MIN_LESS_THAN_MAX: 'Minimum value must be less than maximum value',
        MAX_GREATER_THAN_MIN: 'Maximum value must be greater than minimum value',
        DEVICE_WIDTH_RANGE: 'Device width must be between {min} and {max} px',
        MIN_DEVICE_LESS_THAN_MAX: 'Minimum width must be less than maximum width',
        MAX_DEVICE_GREATER_THAN_MIN: 'Maximum width must be greater than minimum width',
    },
    CALCULATION: {
        MISSING_VALUES: 'Minimum and maximum values are required',
        MISSING_UNIT: 'Unit is required',
        INVALID_NUMERIC_VALUES: 'Invalid numeric values',
        CALCULATION_ERROR: 'Calculation error occurred',
        INVALID_SLOPE: 'Invalid slope in clamp function',
        DEVICE_WIDTH_OUT_OF_RANGE: 'Calculated device widths are out of valid range',
    },
    PARSING: {
        INVALID_FORMAT: 'Invalid clamp() function format',
        UNABLE_TO_PARSE_MIN_MAX: 'Unable to parse min/max values',
        UNABLE_TO_PARSE_PREFERRED: 'Unable to parse preferred value (expected format: Xvw ± Yunit)',
        DIFFERENT_UNITS: 'Min and max values must use the same unit',
        PARSING_ERROR: 'Parsing error occurred',
    },
    PROJECT: {
        NAME_ALREADY_EXISTS: 'Project with name "{name}" already exists',
        PRESET_NAME_ALREADY_EXISTS: 'Preset with name "{name}" already exists in this project',
        PROJECT_NOT_FOUND: 'Project not found',
        PRESET_NOT_FOUND: 'Preset not found',
    },
    STORAGE: {
        LOAD_ERROR: 'Error loading data from storage',
        SAVE_ERROR: 'Error saving data to storage',
        INVALID_FORMAT: 'Invalid file format',
    },
    CLIPBOARD: {
        COPY_FAILED: 'Failed to copy to clipboard',
        NOTHING_TO_COPY: 'Nothing to copy',
        OPERATION_FAILED: 'Copy operation failed',
    },
    IMPORT_EXPORT: {
        INVALID_JSON: 'Invalid JSON file or unsupported format',
        FILE_TOO_LARGE: 'File is too large',
        UNSUPPORTED_FORMAT: 'Unsupported file format',
    },
} as const

export const SUCCESS_MESSAGES = {
    PROJECT: {
        CREATED: 'Project created successfully',
        UPDATED: 'Project updated successfully',
        DELETED: 'Project deleted successfully',
    },
    PRESET: {
        CREATED: 'Preset created successfully',
        UPDATED: 'Preset updated successfully',
        DELETED: 'Preset deleted successfully',
        SAVED: 'Current configuration saved as preset',
    },
    CLIPBOARD: {
        COPIED: 'Copied to clipboard successfully',
    },
    IMPORT_EXPORT: {
        EXPORTED: 'Data exported successfully',
        IMPORTED: 'Data imported successfully',
    },
} as const

export const INFO_MESSAGES = {
    VALIDATION: {
        FIX_ERRORS: 'Please fix the errors above',
    },
    CALCULATION: {
        IN_PROGRESS: 'Calculating...',
        COMPLETED: 'Calculation completed',
    },
} as const
