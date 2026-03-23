<template>
  <img :src="src" />
</template>

<script setup>
defineProps({
  src: {
    type: String,
    required: true,
  },
})
</script>

<style scoped>
img {
  max-width: 78vw;
  max-height: 80vh;
  width: auto;
  height: auto;
  display: block;
  object-fit: contain;
}
</style>
