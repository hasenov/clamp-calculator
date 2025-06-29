export interface RadioOption {
    value: string
    label: string
    description?: string
}

export interface InputField {
    id: string
    label: string
    placeholder?: string
    helper?: string
    type?: 'text' | 'number'
    min?: number
    max?: number
}

export type ButtonVariant = 'default' | 'success' | 'danger' | 'primary'
export type SectionVariant = 'default' | 'gradient'

export interface BaseComponentProps {
    class?: string
    style?: Record<string, any>
}

export interface FormComponentProps extends BaseComponentProps {
    disabled?: boolean
    readonly?: boolean
}

// Emit events for form components
export interface InputEmits {
    'update:modelValue': [value: string | number]
    blur: []
    focus: []
}

export interface ButtonEmits {
    click: []
}

export interface RadioGroupEmits {
    'update:modelValue': [value: string]
}
