<template>
  <TheMainLayout>
    <template #default>
      <div class="page-header">
        <h1>Book Shelf</h1>
      </div>
      <div class="shelf horizontal-flex item-selection">
        <BookInfoCover
          v-for="book in shelf.books"
          :key="book.id"
          :book="book"
          @click="loadBook(book)"
        />
      </div>
    </template>
  </TheMainLayout>
</template>

<script setup>
import TheMainLayout from '@/layouts/TheMainLayout.vue'
import BookInfoCover from '@/components/BookInfoCover.vue'
import { useShelfStore } from '@/stores/shelf'
const shelf = useShelfStore()
import { useBookStore } from '@/stores/book'
const bookStore = useBookStore()
import { useRouter } from 'vue-router'
const router = useRouter()

const loadBook = async (book) => {
  await bookStore.loadBook(book.id)
  router.push('/setup')
}
</script>

<style scoped>
.shelf {
  justify-content: center;
}
</style>
