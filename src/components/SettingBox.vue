<template>
  <div class="box setting-box" :class="collapsedClass" @click="toggle">
    <header>
      <small>{{ props.hint }}</small>
      <h3 class="hint-anchor">
        {{ props.setting.name }}<span class="hint">{{ props.setting.commandId }}</span>
      </h3>
    </header>
    <LightboxImage :src="'images/M/' + props.setting.image" class="image" />
    <main>
      {{ props.setting.description }}
    </main>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import LightboxImage from '@/components/LightboxImage.vue'

const props = defineProps({
  hint: {
    type: String,
    required: true,
  },
  setting: {
    type: Object,
    required: true,
  },
  collapsed: {
    type: Boolean,
    default: true,
  },
})

// Collapse box for better overview
const isCollapsed = ref(props.collapsed)
const collapsedClass = computed(() => (isCollapsed.value ? 'collapsed' : ''))
const toggle = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>

<style scoped>
/* The information setting-boxes */
.setting-box {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto auto auto;
  grid-template-areas:
    'header'
    'image'
    'description';
  cursor: pointer;
}
.setting-box.collapsed {
  grid-template-columns: 5.1rem 1fr; /* TODO: das sollte eher über eine natürliche Höhe gehen */
  grid-template-rows: auto;
  grid-template-areas: 'image header';
}

/* The setting-box header */
.setting-box header {
  text-align: center;
  padding: 0 0.5rem;
}
.setting-box header small {
  margin: 0;
}
.setting-box header h3 {
  grid-area: header;
  margin: 0 0 0.35rem;
}
.setting-box.collapsed header {
  text-align: left;
}

/* The setting-box image */
.setting-box > .image {
  grid-area: image;
  width: 100%;
}

/* The setting-box main text */
.setting-box > main {
  grid-area: description;
  padding: 0.5rem;
}
.setting-box.collapsed > main {
  display: none;
}
</style>
