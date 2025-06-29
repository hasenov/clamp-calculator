<script setup lang="ts">
// No props needed for this component
</script>

<template>
    <header class="header">
        <div class="header__content">
            <h1 class="header__title">CSS Clamp Calculator</h1>
            <p class="header__subtitle">
                Create perfect responsive values for modern web development
            </p>
        </div>
    </header>
</template>

<style scoped>
.header {
    text-align: center;
    margin-bottom: 32px;
    padding: 0 16px;
}

.header__content {
    max-width: 600px;
    margin: 0 auto;
}

.header__title {
    color: #1a202c;
    font-size: clamp(2rem, 4vw, 2.75rem);
    font-weight: 800;
    background: linear-gradient(135deg, #4f46e5, #7c3aed, #db2777);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 12px;
    letter-spacing: -0.025em;
    line-height: 1.1;
}

.header__subtitle {
    color: #64748b;
    font-size: clamp(1rem, 2.5vw, 1.125rem);
    font-weight: 500;
    line-height: 1.5;
    max-width: 480px;
    margin: 0 auto;
}

@media (max-width: 640px) {
    .header {
        margin-bottom: 24px;
    }
}
</style>
