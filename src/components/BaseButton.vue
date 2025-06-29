<script setup lang="ts">
interface Props {
    variant?: 'primary' | 'secondary' | 'success'
    size?: 'sm' | 'md' | 'lg'
    disabled?: boolean
    loading?: boolean
}

interface Emits {
    (event: 'click'): void
}

withDefaults(defineProps<Props>(), {
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
})

const emit = defineEmits<Emits>()

const handleClick = () => {
    emit('click')
}
</script>

<template>
    <button
        :class="[
            'btn',
            `btn--${variant}`,
            `btn--${size}`,
            {
                'btn--disabled': disabled,
                'btn--loading': loading,
            },
        ]"
        :disabled="disabled || loading"
        @click="handleClick"
    >
        <span v-if="loading" class="btn__spinner"></span>
        <span :class="{ 'btn__content--loading': loading }" class="btn__content">
            <slot />
        </span>
    </button>
</template>

<style scoped>
.btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: none;
    border-radius: 12px;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.2s ease;
    text-decoration: none;
    outline: none;
    user-select: none;
    white-space: nowrap;
    overflow: hidden;
}

.btn:focus-visible {
    outline: 2px solid #4f46e5;
    outline-offset: 2px;
}

/* Sizes */
.btn--sm {
    padding: 8px 16px;
    font-size: 0.875rem;
    min-height: 36px;
    border-radius: 8px;
}

.btn--md {
    padding: 12px 20px;
    font-size: 0.9375rem;
    min-height: 44px;
}

.btn--lg {
    padding: 16px 24px;
    font-size: 1rem;
    min-height: 52px;
    border-radius: 16px;
}

/* Primary variant */
.btn--primary {
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    color: white;
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

.btn--primary:hover:not(.btn--disabled):not(.btn--loading) {
    background: linear-gradient(135deg, #4338ca, #6d28d9);
    box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4);
    transform: translateY(-1px);
}

.btn--primary:active:not(.btn--disabled):not(.btn--loading) {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(79, 70, 229, 0.3);
}

/* Secondary variant */
.btn--secondary {
    background: #f8fafc;
    color: #475569;
    border: 1.5px solid #e2e8f0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.btn--secondary:hover:not(.btn--disabled):not(.btn--loading) {
    background: #f1f5f9;
    border-color: #cbd5e1;
    color: #334155;
}

.btn--secondary:active:not(.btn--disabled):not(.btn--loading) {
    background: #e2e8f0;
}

/* Success variant */
.btn--success {
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn--success:hover:not(.btn--disabled):not(.btn--loading) {
    background: linear-gradient(135deg, #059669, #047857);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
    transform: translateY(-1px);
}

/* Disabled state */
.btn--disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none !important;
    transform: none !important;
}

/* Loading state */
.btn--loading {
    cursor: wait;
}

.btn__content--loading {
    opacity: 0.7;
}

.btn__spinner {
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top: 2px solid currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

@media (max-width: 640px) {
    .btn--md {
        padding: 10px 18px;
        min-height: 40px;
    }

    .btn--lg {
        padding: 14px 22px;
        min-height: 48px;
    }
}
</style>
