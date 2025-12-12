<template>
  <button :class="cssClasses">
    <font-awesome-icon v-if="icon" :icon="`fa-${icon}`" />
    {{ props.text }}
    <span v-if="pill" class="pill">{{ pill }}</span>
  </button>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  text: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    default: null,
  },
  image: {
    type: String,
    default: null,
  },
  pill: {
    type: String,
    default: null,
  },
})

const cssClasses = computed(() => {
  if (props.icon) {
    return ['icon-button']
  }
  return []
})
</script>

<style scoped>
.icon-button {
  padding-left: 0.5rem;
}
</style>
