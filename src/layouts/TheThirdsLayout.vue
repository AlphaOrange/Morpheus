<template>
  <TheMainLayout>
    <div class="page">
      <div class="third left">
        <slot name="leftSlot">[no content]</slot>
      </div>
      <div class="third middle">
        <slot name="middleSlot">[no content]</slot>
      </div>
      <div class="third right">
        <slot name="rightSlot">[no content]</slot>
      </div>
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
  min-height: 100vh;
  background: var(--bg-page);
  display: grid;
  grid-template-columns: 1fr 3fr 1fr;
}

.third {
  padding: 1rem;
  height: 100vh;
  overflow: auto;
}

.middle {
  background: var(--bg-body);
}
</style>
