<template>
  <div class="book-preview">
    <img :src="cover" class="cover" />
    <div>
      <h2>
        {{ book.title }} <small>{{ book.version.book }}</small>
      </h2>
      <p class="sub-heading">by {{ book.author }}</p>
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
footer {
  position: absolute;
  bottom: 0.5rem;
  left: 0.5rem;
}
</style>
