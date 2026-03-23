<template>
  <div class="darkpane" @click.self="emits('hide')">
    <div class="area" @click.self="emits('hide')">
      <div class="lightbox">
        <component :is="component" v-bind="cp" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  component: {
    type: [Object, Function, String],
    required: true,
  },
  contentProps: {
    type: Object,
    default: () => ({}),
  },
})
const cp = computed(() => {
  console.log(props.contentProps)
  return props.contentProps
})
const emits = defineEmits(['hide'])
</script>

<style scoped>
.darkpane {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 99999;
}

.area {
  position: fixed;
  left: 10vw;
  width: 80vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.lightbox {
  background: var(--bg-page);
  border: 0.5rem solid var(--bg-highlight);
  border-radius: 1rem;
  box-shadow: var(--center-shadow);
  overflow: hidden;
}
</style>
