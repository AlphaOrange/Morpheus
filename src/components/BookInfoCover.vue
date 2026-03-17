<template>
  <div class="book" :style="{ backgroundImage: `url(${cover})` }">
    <header>
      <div class="title">{{ book.title }}</div>
      <div class="author">by {{ book.author }}</div>
      <div v-if="showDescription" class="description">{{ book.description }}</div>
    </header>
    <footer>
      <span v-for="tag in tags" :key="tag" class="tag">
        {{ tag }}
      </span>
      <div v-if="supported === 'min'" class="support-warning">
        created for Morpheus {{ book.version.book }}, some features may be unsupported
      </div>
      <div v-if="supported === 'unsupported'" class="support-warning">
        created for Morpheus {{ book.version.book }}, no longer supported
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { genericImg, bookImg, checkSupported } from '@/helpers/utils'
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

const tags = computed(() => {
  const version = 'v' + props.book.version.book
  return [version, ...props.book.tags]
})

const supported = computed(() => {
  return checkSupported(props.book.version.book)
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
  width: calc(100% - 1rem);
}
.tag {
  background: rgba(0, 0, 0, 0.5);
  padding: 0.1rem 0.3rem;
  margin-right: 0.2rem;
  border-radius: 0.2rem;
  color: white;
  font-size: 0.85rem;
}
.support-warning {
  background: var(--bg-warning);
  margin-top: 0.25rem;
  padding: 0.1rem 0.3rem;
  border-radius: 0.2rem;
  color: white;
  font-size: 0.85rem;
}
</style>
