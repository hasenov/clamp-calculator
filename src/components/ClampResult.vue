<script setup lang="ts">
import BaseFormSection from './BaseFormSection.vue'
import BaseButton from './BaseButton.vue'
import ClampInputOutput from './ClampInputOutput.vue'
import { BUTTON_LABELS } from '@/constants/ui.constants'

interface Props {
    result: string
    hasErrors: boolean
    copySuccess: boolean
}

interface Emits {
    (event: 'copy'): void
    (event: 'reset'): void
    (event: 'parse', value: string): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const handleCopy = () => {
    emit('copy')
}

const handleReset = () => {
    emit('reset')
}

const handleParse = (clampString: string) => {
    emit('parse', clampString)
}
</script>

<template>
    <BaseFormSection title="Generated clamp() Function" variant="gradient" icon="⚡">
        <ClampInputOutput
            :result="result"
            :has-errors="hasErrors"
            :copy-success="copySuccess"
            @copy="handleCopy"
            @parse="handleParse"
        />

        <div class="result-actions">
            <BaseButton variant="secondary" size="lg" @click="handleReset">
                {{ BUTTON_LABELS.RESET }}
            </BaseButton>
        </div>

        <div class="help-text">
            <p>
                💡 <strong>Tip:</strong> Paste any clamp() function to automatically update all
                inputs! Make sure to set correct Root Font Size.
            </p>
        </div>
    </BaseFormSection>
</template>

<style scoped>
.result-actions {
    display: flex;
    gap: 16px;
    justify-content: center;
    flex-wrap: wrap;
    margin-top: 24px;
}

.help-text {
    margin-top: 16px;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.15);
}

.help-text p {
    margin: 0;
    font-size: 0.9375rem;
    color: rgba(255, 255, 255, 0.9);
    text-align: center;
    line-height: 1.4;
}

.help-text strong {
    color: white;
}

@media (max-width: 640px) {
    .result-actions {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
    }

    .help-text {
        padding: 10px 12px;
    }

    .help-text p {
        font-size: 0.875rem;
    }
}
</style>
