<template>
  <div class="body" :class="flags">
    <Transition name="lightbox">
      <TheLightbox
        v-if="options.lightboxImage"
        :image="options.lightboxImage"
        @hide="hideSidebar"
      />
    </Transition>
    <TheMainLayout>
      <RouterView />
    </TheMainLayout>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { RouterView } from 'vue-router'
import TheLightbox from '@/components/TheLightbox.vue'
import TheMainLayout from '@/layouts/TheMainLayout.vue'

import { useOptionsStore } from '@/stores/options'
const options = useOptionsStore()

const flags = computed(() => {
  const cssFlags = []
  if (options.showIdHints) {
    cssFlags.push('flag-show-hints')
  }
  return cssFlags
})

const hideSidebar = () => {
  options.lightboxImage = null
}
</script>

<style scoped></style>
