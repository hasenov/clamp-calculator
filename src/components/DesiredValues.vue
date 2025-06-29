<script setup lang="ts">
import { computed } from 'vue'
import BaseFormSection from './BaseFormSection.vue'
import BaseInput from './BaseInput.vue'
import BaseRadioGroup from './BaseRadioGroup.vue'
import BaseToggle from './BaseToggle.vue'
import { INPUT_PLACEHOLDERS } from '../constants/ui.constants'
import type { ValidationErrors, RadioOption, CSSUnit } from '../types'

interface Props {
    minValue: string
    maxValue: string
    unit: CSSUnit
    convertToRem: boolean
    errors: ValidationErrors
}

interface Emits {
    (event: 'update:minValue', value: string): void
    (event: 'update:maxValue', value: string): void
    (event: 'update:unit', value: CSSUnit): void
    (event: 'update:convertToRem', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const unitOptions: RadioOption[] = [
    { value: 'rem', label: 'rem' },
    { value: 'px', label: 'px' },
    { value: 'em', label: 'em' },
]

const showConvertToggle = computed(() => props.unit === 'px')

const getPlaceholder = (type: 'min' | 'max') => {
    const examples = {
        rem: type === 'min' ? INPUT_PLACEHOLDERS.MIN_VALUE_REM : INPUT_PLACEHOLDERS.MAX_VALUE_REM,
        px: type === 'min' ? INPUT_PLACEHOLDERS.MIN_VALUE_PX : INPUT_PLACEHOLDERS.MAX_VALUE_PX,
        em: type === 'min' ? INPUT_PLACEHOLDERS.MIN_VALUE_EM : INPUT_PLACEHOLDERS.MAX_VALUE_EM,
    }
    return examples[props.unit]
}

const getHelper = (type: 'min' | 'max') => {
    const base = type === 'min' ? 'Minimum' : 'Maximum'
    if (props.unit === 'px' && props.convertToRem) {
        return `${base} value in px (will be converted to rem)`
    }
    return `${base} value in ${props.unit}`
}
</script>

<template>
    <BaseFormSection title="Desired Values" icon="📐">
        <!-- Unit Selection -->
        <div class="unit-section">
            <BaseRadioGroup
                label="Unit"
                :model-value="unit"
                :options="unitOptions"
                helper="Choose the unit for your values"
                @update:model-value="emit('update:unit', $event as CSSUnit)"
            />
        </div>

        <!-- Convert to REM Toggle (only for px) -->
        <div v-if="showConvertToggle" class="convert-section">
            <BaseToggle
                label="Convert to rem in output"
                :model-value="convertToRem"
                helper="Input values in px, but generate clamp() with rem units"
                @update:model-value="emit('update:convertToRem', $event)"
            />
        </div>

        <!-- Value Inputs -->
        <div class="input-grid">
            <BaseInput
                id="minValue"
                label="Minimum Value"
                type="text"
                :model-value="minValue"
                :placeholder="getPlaceholder('min')"
                :helper="getHelper('min')"
                icon="📏"
                :error="errors.minValue"
                @update:model-value="emit('update:minValue', $event as string)"
            />

            <BaseInput
                id="maxValue"
                label="Maximum Value"
                type="text"
                :model-value="maxValue"
                :placeholder="getPlaceholder('max')"
                :helper="getHelper('max')"
                icon="📏"
                :error="errors.maxValue"
                @update:model-value="emit('update:maxValue', $event as string)"
            />
        </div>

        <!-- Info Section -->
        <div class="info-card">
            <p class="info-text">
                These values define the range of your responsive property. The clamp() function will
                interpolate between them based on the viewport width.
            </p>
        </div>
    </BaseFormSection>
</template>

<style scoped>
.unit-section {
    margin-bottom: 20px;
    padding: 16px;
    background: #f8fafc;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
}

.convert-section {
    margin-bottom: 20px;
    padding: 16px;
    background: linear-gradient(135deg, #fef3c7, #fde68a);
    border-radius: 12px;
    border: 1px solid #f59e0b;
}

.input-grid {
    margin-bottom: 16px;
}

@media (max-width: 768px) {
    .unit-section,
    .convert-section {
        padding: 12px;
    }
}
</style>
