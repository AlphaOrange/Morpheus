<template>
  <div class="book" :style="{ backgroundImage: `url(${cover})` }">
    <header>
      <div class="title">{{ book.title }}</div>
      <div class="author">by {{ book.author }}</div>
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
import { computed } from 'vue'
import { genericImg, bookImg } from '@/helpers/utils'
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

const cover = computed(() => {
  if (props.book.coverL) {
    return props.book.coverL
  } else if (props.book.cover) {
    // for pre-load
    return bookImg({ filename: props.book.cover, size: 'L', bookId: props.book.id })
  } else {
    return genericImg({ filename: 'generic_cover.jpg', size: 'L' })
  }
})
</script>

<style scoped>
.book {
  position: relative;
  width: 18rem;
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
  font-size: 1.5rem;
  font-weight: 700;
}
.author {
  text-align: center;
  margin-bottom: 0.5rem;
  font-size: 0.75rem;
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
