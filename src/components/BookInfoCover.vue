<template>
  <div class="book" :style="{ backgroundImage: `url(images/${cover})` }">
    <header>
      <div class="title">{{ book.title }}</div>
      <div v-if="showDescription" class="description">{{ book.description }}</div>
    </header>
    <footer>
      <span v-for="tag in book.tags" :key="tag" class="tag">
        {{ tag }}
      </span>
    </footer>
  </div>
</template>

<script setup>
const props = defineProps({
  book: {
    type: Object,
    required: true,
  },
  showDescription: {
    type: Boolean,
    default: true,
  },
})

const cover = props.book.cover === '' ? 'generic_cover.jpg' : props.book.cover
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
