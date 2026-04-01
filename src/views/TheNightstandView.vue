<template>
  <TheSingleLayout>
    <template #titleSlot>Nightstand</template>
    <template #subtitleSlot>All Your Savegames</template>
    <template #contentSlot>
      <div v-if="bookStore.started" class="box warning-box">
        <h3>Currently In Play</h3>
        <div class="warning-message">
          The book '{{ bookStore.title }}' is currently loaded. If you choose another book now (or
          even the same book), all unsaved progress will be lost!
        </div>
        <div class="button-list">
          <ActionButton :text="`Continue Playing`" :color="`dark`" @click="goToPlay" />
          <ActionButton :text="`Save and Close`" :color="`dark`" @click="saveClose" />
          <ActionButton :text="`Close without Save`" :color="`dark`" @click="justClose" />
        </div>
      </div>
      <div class="shelf horizontal-flex item-selection">
        <div
          class="cover"
          v-for="book in savegames"
          :key="book.id"
          :style="{ backgroundImage: `url(${cover(book)})` }"
          @click="loadSavegame(book)"
          @mouseover="setPreview(book)"
        />
      </div>
      <BookPreview v-if="previewBook" :book="previewBook" :savegame="true" class="preview" />
    </template>
  </TheSingleLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import TheSingleLayout from '@/layouts/TheSingleLayout.vue'
import BookPreview from '@/components/BookPreview.vue'
import ActionButton from '@/components/ActionButton.vue'
import { genericImg, bookImg } from '@/helpers/utils'

import { useShelfStore } from '@/stores/shelf'
const shelf = useShelfStore()
import { useBookStore } from '@/stores/book'
const bookStore = useBookStore()
import { useRouter } from 'vue-router'
const router = useRouter()

const previewBook = ref(null)
const setPreview = (book) => (previewBook.value = book)

// NOTE: There is a lot of workarounds here because Morpheus currently only supports one savegames
//       But I already built this for supporting multi savegames

const savegames = computed(() => {
  if (shelf.saveData) {
    return [shelf.saveData.book]
  } else {
    return []
  }
})

// Load selected book
const loadSavegame = async (book) => {
  shelf.loadBook()
  router.push('/book')
}

// Book cover
const cover = (book) => {
  if (book._cover) {
    return bookImg({ filename: book._cover, size: 'M', bookId: book.id })
  } else {
    return genericImg({ filename: 'generic_cover.jpg', size: 'M' })
  }
}

// Handling warning box
const goToPlay = () => router.push('/book')
const saveClose = async () => {
  await shelf.saveBook()
  bookStore.deactivateBook()
}
const justClose = () => bookStore.deactivateBook()
</script>

<style scoped>
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

.shelf {
  margin: 0 -1rem 1rem;
  padding: 1rem;
  justify-content: center;
  background: var(--bg-body);
  border-top: 0.25rem solid var(--bg-box);
  border-bottom: 0.25rem solid var(--bg-box);
}

.cover {
  position: relative;
  width: 8rem;
  aspect-ratio: 2 / 3;
  border-radius: 0.5rem;
  background-position: center center;
  background-size: cover;
  overflow: hidden;
}

.preview {
  max-width: 50rem;
  margin: 0 auto;
}
</style>
