<template>
  <div class="darkpane" @click="emits('hide')">
    <div class="lightbox">
      <img :src="props.image" />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  image: {
    type: String,
    required: true,
  },
})
const emits = defineEmits(['hide'])
</script>

<style>
.darkpane {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
}
.lightbox {
  max-width: 80%;
  max-height: 80%;
  background: var(--bg-highlight);
  border-radius: 1rem;
}
img {
  display: block;
  margin: 0.5rem;
  border-radius: 0.5rem;
}
</style>
