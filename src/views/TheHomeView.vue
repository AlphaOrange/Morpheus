<template>
  <TheMainLayout>
    <template #default>
      <div class="content">
        <div class="page-header">
          <h1>Book Shelf</h1>
        </div>
        <div class="shelf horizontal-flex item-selection">
          <SavegameCover
            v-if="shelf.hasSaveData"
            :saveData="shelf.saveData"
            @click="loadSavegame"
          />
          <BookInfoCover
            v-for="book in shelf.books"
            :key="book.id"
            :book="book"
            @click="loadBook(book)"
          />
        </div>
        <BlackOverlay v-if="showOverlay" @close="closeOverlay">
          <template #default>
            <div class="warning">
              <h3>One Second ...</h3>
              <div class="warning-message">
                The book '{{ bookStore.title }}' is currently loaded. If you chose another book now
                (or even the same book), all unsaved progress will be lost!
              </div>
            </div>
          </template>
        </BlackOverlay>
      </div>
    </template>
  </TheMainLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import TheMainLayout from '@/layouts/TheMainLayout.vue'
import BlackOverlay from '@/layouts/BlackOverlay.vue'
import BookInfoCover from '@/components/BookInfoCover.vue'
import SavegameCover from '@/components/SavegameCover.vue'

import { useShelfStore } from '@/stores/shelf'
const shelf = useShelfStore()
import { useBookStore } from '@/stores/book'
const bookStore = useBookStore()
import { useRouter } from 'vue-router'
const router = useRouter()

// Load selected book
const loadBook = async (book) => {
  await bookStore.loadBook(book.id)
  router.push('/setup')
}

const loadSavegame = async () => {
  shelf.loadBook()
  router.push('/book')
}

const askOverlay = ref(true)
const showOverlay = computed(() => {
  return bookStore.loaded && askOverlay.value
})
const closeOverlay = () => {
  askOverlay.value = false
}
</script>

<style scoped>
.content {
  position: relative;
}
.shelf {
  justify-content: center;
}
.warning {
  text-align: center;
}
</style>
