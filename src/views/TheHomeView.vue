<template>
  <TheSingleLayout>
    <div class="content">
      <div class="page-header">
        <h1>Book Shelf</h1>
      </div>
      <div v-if="showWarning" class="box warning-box">
        <h3>Currently In Play</h3>
        <div class="warning-message">
          The book '{{ bookStore.title }}' is currently loaded. If you choose another book now (or
          even the same book), all unsaved progress will be lost!
        </div>
        <ActionButton :text="`Continue Playing`" :color="`dark`" @click="goToPlay" />
        <ActionButton :text="`Save and Close`" :color="`dark`" @click="saveClose" />
        <ActionButton :text="`Close without Save`" :color="`dark`" @click="justClose" />
      </div>
      <div class="shelf horizontal-flex item-selection">
        <SavegameCover v-if="shelf.hasSaveData" :saveData="shelf.saveData" @click="loadSavegame" />
        <BookInfoCover
          v-for="book in shelf.books"
          :key="book.id"
          :book="book"
          @click="loadBook(book)"
        />
      </div>
    </div>
  </TheSingleLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import TheSingleLayout from '@/layouts/TheSingleLayout.vue'
import BookInfoCover from '@/components/BookInfoCover.vue'
import SavegameCover from '@/components/SavegameCover.vue'
import ActionButton from '@/components/ActionButton.vue'

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

// Handling warning box
const allowWarning = ref(true)
const showWarning = computed(() => allowWarning.value && bookStore.started)

const goToPlay = () => router.push('/book')
const saveClose = () => {
  shelf.saveBook()
  allowWarning.value = false
}
const justClose = () => (allowWarning.value = false)
</script>

<style scoped>
.content {
  position: relative;
}
.shelf {
  justify-content: center;
}
.warning-box {
  max-width: 40rem;
  margin: 0 auto 1rem;
  padding: 0.5rem;
  text-align: center;
  background: var(--bg-warning);
}
.warning-box h3 {
  margin-bottom: 0.5rem;
}
.warning-message {
  margin-bottom: 1rem;
}
</style>
