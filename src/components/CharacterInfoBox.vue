<template>
  <div class="box character-box" :class="collapsedClass" @click="toggle">
    <img :src="'images/L/' + props.character.image" />
    <div class="info-box">
      <h3 class="hint-anchor">
        {{ props.character.name }}<span class="hint">{{ props.character.id }}</span>
      </h3>
      <div class="profession">{{ props.character.profession }}</div>
      <div class="socio">{{ props.character.gender }} / {{ props.character.age }} years old</div>
      <div class="description">{{ shortDescription }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { truncateString } from '@/helpers/utils'

const props = defineProps({
  character: {
    type: Object,
    required: true,
  },
  collapsible: {
    type: Boolean,
    default: false,
  },
  collapsed: {
    type: Boolean,
    default: false,
  },
})

// Collapse box for better overview
const isCollapsed = ref(props.collapsed)
const collapsedClass = computed(() => (isCollapsed.value ? 'collapsed' : ''))
const toggle = () => {
  if (props.collapsible) {
    isCollapsed.value = !isCollapsed.value
  }
}

const shortDescription = computed(() => truncateString(props.character.description, 120))
</script>

<style scoped>
.info-box {
  padding: 1rem;
  cursor: pointer;
}
.collapsed .info-box {
  padding: 0.5rem;
}
img {
  display: block;
  float: left;
  width: 8rem;
  height: auto;
  margin: 0 1rem 0 0;
}
.collapsed img {
  width: 4rem;
  margin-right: 0.5rem;
}
.profession {
  margin: -0.75rem 0 0;
}
.socio {
  font-size: 0.75rem;
  margin: 0 0 0.5rem;
}
.collapsed .description {
  display: none;
}
</style>
