<template>
  <TheThirdsLayout>
    <template #leftSlot>
      <h3>Buch-Settings</h3>
      Noch keine Einstellungen verfügbar.
      <br /><br />
      <button @click="startBook" :disabled="!checkConditions">Buch starten</button>
    </template>
    <template #middleSlot>
      <div class="page-header">
        <h1>Auf ins Abenteuer</h1>
        <h2>{{ title }}</h2>
      </div>
      <div class="page-content">
        <h3>Mindestens 1 Spielerfigur auswählen:</h3>
        <div class="horizontal-flex item-selection">
          <CharacterInfoBox
            v-for="char in playableCharacters"
            :character="char"
            :key="char"
            :class="isSelected(char.id)"
            @click="selectPlayer(char.id)"
          />
        </div>
      </div>
    </template>
    <template #rightSlot>
      <div class="vertical-center-flex">
        <BookInfoCover :book="book" :showDescription="false" />
        <div class="book-info">
          <span>{{ description }}</span>
          <h3>{{ world.name }}</h3>
          <img :src="'images/' + world.image" />
          {{ world.description }}
        </div>
      </div>
    </template>
  </TheThirdsLayout>
</template>

<script setup>
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import TheThirdsLayout from '@/layouts/TheThirdsLayout.vue'
import BookInfoCover from '@/components/BookInfoCover.vue'
import CharacterInfoBox from '@/components/CharacterInfoBox.vue'

import { useBookStore } from '@/stores/book'
const book = useBookStore()
const { title, description, world, playableCharacters } = storeToRefs(book)

import { useRouter } from 'vue-router'
const router = useRouter()

const playerSelection = ref(new Set()) // selected player characters

// Select or unselect character as player character
const selectPlayer = (id) => {
  if (playerSelection.value.has(id)) {
    playerSelection.value.delete(id)
  } else {
    playerSelection.value.add(id)
  }
}

// Is a character (id) selected as player?
const isSelected = (id) => {
  if (playerSelection.value.has(id)) {
    return 'selected'
  } else {
    return ''
  }
}

// Check if settings are okay and user may start book
const checkConditions = computed(() => playerSelection.value.size > 0)

// Start the book
const startBook = async () => {
  book.setAsPlayers(playerSelection.value)
  await book.startBook()
  router.push('/book')
}
</script>

<style scoped>
.book-info > img {
  width: 100%;
  height: auto;
  margin-bottom: 0.5rem;
  border-radius: 0.5rem;
}
</style>
