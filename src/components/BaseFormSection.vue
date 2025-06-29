<script setup lang="ts">
interface Props {
    title: string
    variant?: 'default' | 'gradient'
    icon?: string
}

withDefaults(defineProps<Props>(), {
    variant: 'default',
})
</script>

<template>
    <section class="section" :class="{ 'section--gradient': variant === 'gradient' }">
        <div class="section__header">
            <h2 class="section__title">
                <span v-if="icon" class="section__icon">{{ icon }}</span>
                {{ title }}
            </h2>
        </div>
        <div class="section__content">
            <slot />
        </div>
    </section>
</template>

<style scoped>
.section {
    margin-bottom: 24px;
    background: white;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.section--gradient {
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    border: none;
    color: white;
    box-shadow: 0 8px 32px rgba(79, 70, 229, 0.3);
    position: relative;
}

.section--gradient::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23dots)"/></svg>');
    pointer-events: none;
}

.section__header {
    padding: 20px 24px 0;
    position: relative;
    z-index: 1;
}

.section__title {
    color: #1e293b;
    margin: 0;
    font-size: 1.125rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 12px;
    letter-spacing: -0.025em;
}

.section--gradient .section__title {
    color: white;
}

.section__icon {
    font-size: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: rgba(79, 70, 229, 0.1);
    border-radius: 8px;
    flex-shrink: 0;
}

.section--gradient .section__icon {
    background: rgba(255, 255, 255, 0.2);
}

.section__content {
    padding: 20px 24px 24px;
    position: relative;
    z-index: 1;
}

@media (max-width: 640px) {
    .section__header {
        padding: 16px 20px 0;
    }

    .section__content {
        padding: 16px 20px 20px;
    }

    .section__title {
        font-size: 1rem;
        gap: 10px;
    }

    .section__icon {
        width: 24px;
        height: 24px;
        font-size: 1rem;
    }
}
</style>
