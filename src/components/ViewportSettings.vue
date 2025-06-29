<script setup lang="ts">
import BaseFormSection from './BaseFormSection.vue'
import BaseRadioGroup from './BaseRadioGroup.vue'
import BaseInput from './BaseInput.vue'
import type { ValidationErrors, RadioOption } from '../types'
import { INPUT_HELPERS, ROOT_FONT_SIZE_OPTIONS } from '@/constants/ui.constants'

interface Props {
    rootFontSize: string
    minDevice: number
    maxDevice: number
    errors: ValidationErrors
}

interface Emits {
    (event: 'update:rootFontSize', value: string): void
    (event: 'update:minDevice', value: number): void
    (event: 'update:maxDevice', value: number): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()
</script>

<template>
    <BaseFormSection title="Viewport Settings" icon="💻">
        <div class="settings-grid">
            <div class="form-section-bg">
                <BaseRadioGroup
                    label="Root Font Size"
                    :model-value="rootFontSize"
                    :options="ROOT_FONT_SIZE_OPTIONS"
                    :helper="INPUT_HELPERS.ROOT_FONT_SIZE"
                    @update:model-value="emit('update:rootFontSize', $event)"
                />
            </div>

            <div class="form-section-bg">
                <h3 class="subsection-title">Device Width Range</h3>
                <div class="input-grid">
                    <BaseInput
                        id="minDevice"
                        label="Min Width"
                        type="number"
                        :model-value="minDevice"
                        :min="200"
                        :max="800"
                        placeholder="320"
                        :helper="INPUT_HELPERS.MIN_DEVICE"
                        icon="📱"
                        :error="errors.minDevice"
                        @update:model-value="emit('update:minDevice', $event as number)"
                    />

                    <BaseInput
                        id="maxDevice"
                        label="Max Width"
                        type="number"
                        :model-value="maxDevice"
                        :min="800"
                        :max="3000"
                        placeholder="1366"
                        :helper="INPUT_HELPERS.MAX_DEVICE"
                        icon="🖥️"
                        :error="errors.maxDevice"
                        @update:model-value="emit('update:maxDevice', $event as number)"
                    />
                </div>
            </div>
        </div>
    </BaseFormSection>
</template>

<style scoped>
.settings-grid {
    display: grid;
    gap: 24px;
    margin-bottom: 20px;
}

@media (max-width: 768px) {
    .settings-grid {
        gap: 16px;
    }
}
</style>
