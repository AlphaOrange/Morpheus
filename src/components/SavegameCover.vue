<template>
  <div class="book" :style="{ backgroundImage: `url(images/${cover})` }">
    <header>
      <div class="title">{{ saveData.book.title }}</div>
      <div class="description">{{ saveData.book.description }}</div>
    </header>
    <footer></footer>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  saveData: {
    type: Object,
    required: true,
  },
})

const cover = computed(() => {
  return props.saveData.book._cover === '' ? 'generic_cover.jpg' : props.saveData.book._cover
})
</script>

<style scoped>
.book {
  position: relative;
  width: 100%;
  max-width: 18rem;
  aspect-ratio: 3 / 4;
  border-radius: 0.5rem;
  background-position: center center;
  background-size: cover;
  overflow: hidden;
}
header {
  padding: 0.5rem 0.5rem 0.75rem;
  background: var(--bg-shade);
}
.title {
  text-align: center;
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
  font-weight: 700;
}
.description {
  text-align: center;
  font-size: 1rem;
}
footer {
  position: absolute;
  bottom: 0.5rem;
  left: 0.5rem;
}
.tag {
  background: rgba(0, 0, 0, 0.5);
  padding: 0.1rem 0.3rem;
  margin-right: 0.2rem;
  border-radius: 0.2rem;
  color: white;
  font-size: 0.85rem;
}
</style>
