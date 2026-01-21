<template>
  <div class="layer">
    <div class="content">
      <slot></slot>
      <br />
      <button @click="close">Okay</button>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['close'])
const close = () => {
  emit('close')
}
</script>

<style scoped>
.layer {
  position: absolute;
  top: -1rem;
  /* TODO: there must be a cleaner solution */
  left: -1rem;
  z-index: 9999;
  width: calc(100% + 2rem);
  height: calc(100vh);
  margin: 0;
  border-width: 0;
  background: var(--bg-darkshade);
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}
.content {
  max-width: 50%;
  background: var(--bg-page);
  padding: 1rem;
  border-radius: 0.5rem;
}
button {
}
</style>
