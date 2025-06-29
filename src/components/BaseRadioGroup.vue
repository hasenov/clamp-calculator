<script setup lang="ts">
import type { RadioOption } from '../types'

interface Props {
    label: string
    modelValue: string
    options: RadioOption[]
    helper?: string
}

interface Emits {
    (event: 'update:modelValue', value: string): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const handleChange = (value: string) => {
    emit('update:modelValue', value)
}
</script>

<template>
    <div class="form-group">
        <div class="form-label">{{ label }}</div>
        <div class="radio-group">
            <label
                v-for="option in options"
                :key="option.value"
                class="radio-option"
                :class="{ 'radio-option--active': modelValue === option.value }"
            >
                <input
                    type="radio"
                    :value="option.value"
                    :checked="modelValue === option.value"
                    class="radio-input"
                    @change="handleChange(option.value)"
                />
                <span class="radio-indicator"></span>
                <span class="radio-label">{{ option.label }}</span>
            </label>
        </div>
        <div v-if="helper" class="input-helper">{{ helper }}</div>
    </div>
</template>

<style scoped>
.radio-group {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
}

.radio-option {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    padding: 12px 16px;
    border-radius: 12px;
    transition: all 0.2s ease;
    font-weight: 500;
    font-size: 0.9375rem;
    background: #f8fafc;
    border: 1.5px solid #e2e8f0;
    color: #475569;
    position: relative;
    min-width: 140px;
}

.radio-option:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
}

.radio-option--active {
    background: #ede9fe;
    border-color: #4f46e5;
    color: #4f46e5;
}

.radio-input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
}

.radio-indicator {
    width: 20px;
    height: 20px;
    border: 2px solid #d1d5db;
    border-radius: 50%;
    position: relative;
    transition: all 0.2s ease;
    flex-shrink: 0;
    background: white;
}

.radio-option:hover .radio-indicator {
    border-color: #9ca3af;
}

.radio-option--active .radio-indicator {
    border-color: #4f46e5;
    background: #4f46e5;
}

.radio-option--active .radio-indicator::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 8px;
    height: 8px;
    background: white;
    border-radius: 50%;
}

.radio-label {
    user-select: none;
    line-height: 1.4;
}

@media (max-width: 640px) {
    .radio-group {
        flex-direction: column;
        gap: 12px;
    }

    .radio-option {
        min-width: auto;
        padding: 10px 14px;
    }
}
</style>
