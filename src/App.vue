<template>
  <div class="body" :class="flags">
    <RouterView />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { RouterView } from 'vue-router'

import { useOptionsStore } from '@/stores/options'
const options = useOptionsStore()

const flags = computed(() => {
  const cssFlags = []
  if (options.showIdHints) {
    cssFlags.push('flag-show-hints')
  }
  return cssFlags
})
</script>

<style scoped></style>
