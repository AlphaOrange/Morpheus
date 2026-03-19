<template>
  <div class="book-preview">
    <img :src="cover" class="cover" />
    <div>
      <h2>
        {{ book.title }} <small>{{ book.version.book }}</small>
      </h2>
      <p class="sub-heading">by {{ book.author }}</p>
      <div v-if="supported === 'min'" class="compatibility-warning">
        created for Morpheus {{ book.version.book }}, some features may be unsupported
      </div>
      <div v-if="supported === 'unsupported'" class="compatibility-warning">
        created for Morpheus {{ book.version.book }}, no longer supported
      </div>
      <p>
        <span v-for="tag in book.tags" :key="tag" class="tag">
          {{ tag }}
        </span>
      </p>
      <p>{{ book.description }}</p>
    </div>
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

const supported = computed(() => {
  return checkSupported(props.book.version.book)
})
</script>

<style scoped>
.book-preview {
  width: 100%;
  text-align: left;
  display: grid;
  grid-template-columns: 30% 70%;
  column-gap: 1rem;
}
.cover {
  width: 100%;
  border-radius: 0.5rem;
}
.compatibility-warning {
  background: var(--bg-warning);
  margin-top: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}
</style>
