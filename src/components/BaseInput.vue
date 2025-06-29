<script setup lang="ts">
interface Props {
    id: string
    label: string
    modelValue: string | number
    placeholder?: string
    helper?: string
    error?: string
    type?: 'text' | 'number'
    min?: number
    max?: number
    icon?: string
}

interface Emits {
    (event: 'update:modelValue', value: string | number): void
}

const props = withDefaults(defineProps<Props>(), {
    type: 'text',
})

const emit = defineEmits<Emits>()

const handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement
    const value = props.type === 'number' ? Number(target.value) : target.value
    emit('update:modelValue', value)
}
</script>

<template>
    <div class="form-group">
        <label :for="id" class="form-label">{{ label }}</label>

        <div class="input-wrapper" :class="{ 'input-wrapper--error': error }">
            <span v-if="icon" class="input-icon">{{ icon }}</span>
            <input
                :id="id"
                :type="type"
                :value="modelValue"
                :placeholder="placeholder"
                :min="min"
                :max="max"
                :class="['form-input', { 'form-input--with-icon': icon }]"
                @input="handleInput"
            />
        </div>

        <div v-if="helper && !error" class="input-helper">{{ helper }}</div>
        <div v-if="error" class="error-message">
            <span class="error-icon">⚠</span>
            {{ error }}
        </div>
    </div>
</template>

<style scoped>
.input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.input-wrapper--error {
    --ring-color: #ef4444;
}

.input-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #9ca3af;
    font-size: 1rem;
    z-index: 1;
    pointer-events: none;
}

.form-input {
    width: 100%;
    padding: 12px 16px;
    border: 1.5px solid #d1d5db;
    border-radius: 12px;
    font-size: 0.9375rem;
    font-weight: 500;
    transition: all 0.2s ease;
    background: white;
    color: #111827;
    outline: none;
}

.form-input--with-icon {
    padding-left: 44px;
}

.form-input:focus {
    border-color: #4f46e5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.form-input::placeholder {
    color: #9ca3af;
    font-weight: 400;
}

.input-wrapper--error .form-input {
    border-color: #ef4444;
}

.input-wrapper--error .form-input:focus {
    border-color: #ef4444;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.input-helper {
    margin-top: 6px;
}

.error-message {
    color: #ef4444;
    font-size: 0.8125rem;
    font-weight: 500;
    margin-top: 6px;
    display: flex;
    align-items: center;
    gap: 6px;
    line-height: 1.4;
}

.error-icon {
    font-size: 0.875rem;
    flex-shrink: 0;
}

/* Number input styles */
.form-input[type='number'] {
    -moz-appearance: textfield;
}

.form-input[type='number']::-webkit-outer-spin-button,
.form-input[type='number']::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

@media (max-width: 640px) {
    .form-input {
        padding: 10px 14px;
        font-size: 16px; /* Prevents zoom on iOS */
    }

    .form-input--with-icon {
        padding-left: 40px;
    }

    .input-icon {
        left: 10px;
    }
}
</style>
