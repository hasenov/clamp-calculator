<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Props {
    result: string
    hasErrors: boolean
    copySuccess: boolean
}

interface Emits {
    (event: 'copy'): void
    (event: 'parse', value: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const inputValue = ref('')
const isEditing = ref(false)

// Sync input value with result
watch(
    () => props.result,
    (newResult) => {
        inputValue.value = newResult
    },
    { immediate: true },
)

const handleFocus = () => {
    isEditing.value = true
    // Remove readonly to allow editing
    const input = document.activeElement as HTMLInputElement
    if (input) {
        input.removeAttribute('readonly')
    }

    if (
        inputValue.value === 'Please fix the errors above' ||
        inputValue.value === 'Calculation error occurred'
    ) {
        inputValue.value = ''
    }
}

const handleBlur = () => {
    isEditing.value = false
    // Add readonly back
    const input = document.activeElement as HTMLInputElement
    if (input && input.classList.contains('clamp-input')) {
        input.setAttribute('readonly', 'true')
    }

    // Auto-parse if value changed and contains clamp
    const trimmed = inputValue.value.trim()
    if (trimmed && trimmed !== props.result && trimmed.toLowerCase().includes('clamp(')) {
        emit('parse', trimmed)
    } else if (!trimmed) {
        // Restore original if empty
        inputValue.value = props.result
    }
}

const handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement
    inputValue.value = target.value
}

const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
        const trimmed = inputValue.value.trim()
        if (trimmed && trimmed.toLowerCase().includes('clamp(')) {
            emit('parse', trimmed)
        }
        ;(event.target as HTMLInputElement).blur()
    } else if (event.key === 'Escape') {
        inputValue.value = props.result
        ;(event.target as HTMLInputElement).blur()
    }
}

const handleCopy = () => {
    emit('copy')
}
</script>

<template>
    <div
        class="clamp-input-output"
        :class="{
            'clamp-input-output--error': hasErrors,
            'clamp-input-output--editing': isEditing,
        }"
    >
        <div class="clamp-content">
            <input
                v-model="inputValue"
                class="clamp-input"
                @focus="handleFocus"
                @blur="handleBlur"
                @input="handleInput"
                @keydown="handleKeydown"
                :placeholder="
                    hasErrors
                        ? 'Fix errors or paste clamp() function...'
                        : 'Click to edit or paste clamp() function...'
                "
                spellcheck="false"
                readonly
            />
        </div>

        <div class="input-actions">
            <button
                @click="handleCopy"
                :disabled="hasErrors"
                class="copy-button"
                :class="{ 'copy-button--success': copySuccess }"
                :title="hasErrors ? 'Fix errors first' : 'Copy to clipboard'"
            >
                {{ copySuccess ? '✓' : '📋' }}
            </button>
        </div>
    </div>
</template>

<style scoped>
.clamp-input-output {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    display: flex;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
    position: relative;
    overflow: hidden;
    padding: 0;
}

.clamp-input-output::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
        45deg,
        transparent 30%,
        rgba(255, 255, 255, 0.05) 50%,
        transparent 70%
    );
    animation: shimmer 3s ease-in-out infinite;
    opacity: 0;
    pointer-events: none;
}

.clamp-input-output:hover::before {
    opacity: 1;
}

.clamp-input-output--editing {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(79, 172, 254, 0.5);
    box-shadow: 0 0 0 2px rgba(79, 172, 254, 0.2);
}

.clamp-input-output--editing::before {
    display: none;
}

.clamp-input-output--error {
    background: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.3);
}

.clamp-input-output--error::before {
    display: none;
}

@keyframes shimmer {
    0% {
        transform: translateX(-100%);
    }
    100% {
        transform: translateX(100%);
    }
}

.clamp-content {
    flex: 1;
    display: flex;
    align-items: center;
}

.clamp-input {
    width: 100%;
    height: 100%;
    background: transparent;
    border: none;
    outline: none;
    font-family:
        'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Source Code Pro', 'Consolas', monospace;
    font-size: 1.125rem;
    font-weight: 600;
    color: white;
    padding: 24px;
    box-sizing: border-box;
    letter-spacing: -0.025em;
    line-height: 1.5;
    word-break: break-all;
    resize: none;
    text-align: center;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.clamp-input:focus {
    cursor: text;
}

.clamp-input::placeholder {
    color: rgba(255, 255, 255, 0.6);
    font-weight: 400;
    font-style: italic;
}

.input-actions {
    padding: 12px 16px;
    display: flex;
    gap: 8px;
    align-items: center;
    border-left: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;
}

.copy-button {
    padding: 8px 12px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    backdrop-filter: blur(10px);
    min-width: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.copy-button:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
}

.copy-button--success {
    background: rgba(34, 197, 94, 0.3);
    border-color: rgba(34, 197, 94, 0.4);
    color: white;
}

.copy-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

@media (max-width: 640px) {
    .clamp-input {
        padding: 20px 16px;
        font-size: 1rem;
        line-height: 1.4;
    }

    .clamp-code {
        font-size: 1rem;
        line-height: 1.4;
    }

    .input-actions {
        padding: 8px 12px;
    }

    .copy-button {
        padding: 6px 10px;
        font-size: 0.8125rem;
        min-width: 38px;
    }
}

@media (max-width: 480px) {
    .clamp-input {
        padding: 16px 12px;
        font-size: 0.9375rem;
    }

    .clamp-code {
        font-size: 0.9375rem;
    }
}
</style>
