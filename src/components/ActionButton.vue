<template>
  <button :class="cssClasses">
    <font-awesome-icon v-if="icon" :icon="`fa-${icon}`" />
    {{ props.text }}
    <span v-if="pill" class="pill">{{ pill }}</span>
    <span v-if="hint" class="hint" :class="hintClass">{{ props.hint }}</span>
  </button>
</template>

<script setup>
import { computed } from 'vue'
import { useOptionsStore } from '@/stores/options'
const options = useOptionsStore()

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
  color: {
    type: String,
    default: null,
  },
  hint: {
    type: String,
    default: null,
  },
  compact: {
    type: Boolean,
    default: false,
  },
})

const useCompact = computed(() => {
  return props.compact && options.useCompactButtons
})

const cssClasses = computed(() => {
  let css = []
  if (props.icon) {
    css.push('icon-button')
  }
  if (props.color) {
    css.push('color-' + props.color)
  }
  if (props.hint) {
    css.push('hint-anchor')
  }
  if (useCompact.value) {
    css.push('compact')
  }
  return css
})

const hintClass = computed(() => {
  if (useCompact.value) {
    return ['hint-small']
  } else {
    return []
  }
})
</script>

<style scoped>
.icon-button {
  padding-left: 0.5rem;
}
.color-dark {
  background: var(--bg-page);
}
.hint {
  top: 0.5rem;
}
.pill {
  margin-right: 0;
}

/* Compact Action Buttons */

.compact.icon-button {
  padding: 0.25rem 0.5rem 0.25rem 0.25rem;
  font-size: 85%;
}
.compact.icon-button .hint {
  top: 0.35rem;
}
</style>
