<script setup lang="ts">
interface Props {
    label: string
    modelValue: boolean
    helper?: string
    disabled?: boolean
}

interface Emits {
    (event: 'update:modelValue', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const handleToggle = () => {
    emit('update:modelValue', !props.modelValue)
}
</script>

<template>
    <div class="toggle-group">
        <div class="toggle-wrapper">
            <label class="toggle-label" :class="{ 'toggle-label--disabled': disabled }">
                <input
                    type="checkbox"
                    :checked="modelValue"
                    :disabled="disabled"
                    class="toggle-input"
                    @change="handleToggle"
                />
                <span class="toggle-switch" :class="{ 'toggle-switch--active': modelValue }">
                    <span class="toggle-thumb"></span>
                </span>
                <span class="toggle-text">{{ label }}</span>
            </label>
        </div>
        <div v-if="helper" class="toggle-helper">{{ helper }}</div>
    </div>
</template>

<style scoped>
.toggle-group {
    margin-bottom: 16px;
}

.toggle-wrapper {
    display: flex;
    align-items: center;
}

.toggle-label {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    user-select: none;
    font-weight: 500;
    font-size: 0.9375rem;
    color: #374151;
    transition: color 0.2s ease;
}

.toggle-label--disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.toggle-input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
}

.toggle-switch {
    position: relative;
    width: 44px;
    height: 24px;
    background: #e5e7eb;
    border-radius: 12px;
    transition: all 0.2s ease;
    border: 2px solid transparent;
}

.toggle-switch--active {
    background: #4f46e5;
}

.toggle-thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 16px;
    height: 16px;
    background: white;
    border-radius: 50%;
    transition: transform 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toggle-switch--active .toggle-thumb {
    transform: translateX(20px);
}

.toggle-text {
    font-weight: 500;
    line-height: 1.4;
}

.toggle-helper {
    font-size: 0.8125rem;
    color: #6b7280;
    margin-top: 4px;
    margin-left: 56px;
    line-height: 1.4;
}

.toggle-label:hover .toggle-switch:not(.toggle-switch--active) {
    background: #d1d5db;
}

.toggle-label:hover .toggle-switch--active {
    background: #4338ca;
}

@media (max-width: 640px) {
    .toggle-helper {
        margin-left: 0;
        margin-top: 8px;
    }
}
</style>
