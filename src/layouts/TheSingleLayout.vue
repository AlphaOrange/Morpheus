<template>
  <TheMainLayout>
    <div class="page">
      <slot></slot>
    </div>
  </TheMainLayout>
</template>

<script setup>
import TheMainLayout from '@/layouts/TheMainLayout.vue'
</script>

<style scoped>
.page {
  width: 100%;
  height: 100vh;
  max-width: var(--width-page);
  min-height: 100vh;
  background: var(--bg-page);
  display: flex;
  justify-content: center;
  padding: 1rem;
}
</style>
