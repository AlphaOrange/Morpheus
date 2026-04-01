<template>
  <TheThirdsLayout>
    <template #leftSlot>
      <div class="vertical-flex">
        <RouterLink to="/library">
          <ActionButton text="Back To Library" icon="arrow-left" />
        </RouterLink>
        <div class="box">
          <h3>AI Configuration</h3>
          <div class="input-group">
            <label for="selectAiVendor">Model Name:</label>
            <select v-model="options.aiVendor" id="selectAiVendor" class="long">
              <option>Google</option>
            </select>
            <label for="selectAiVersion">Model Version:</label>
            <select v-model="options.aiModel" id="selectAiVersion" class="long">
              <option>gemini-2.5-flash</option>
              <option>gemini-2.5-flash-lite</option>
            </select>
          </div>
          <h3>API Key:</h3>
          <div class="input-group">
            <input
              type="text"
              v-model="options.aiApiKey"
              placeholder="insert valid key"
              class="long"
            />
            <input type="checkbox" id="idAiApiKeyAllowSave" v-model="options.aiApiKeyAllowSave" />
            <label for="idAiApiKeyAllowSave">Store key with savegame</label>
          </div>
        </div>
        <div v-if="options.aiApiKey === ''" class="box warning-box">
          <div>
            You did not yet enter an API key. Without LLM model connection functionality is
            extremely limited!
          </div>
        </div>
        <div>
          <button @click="startBook" :disabled="!checkConditions">Start Book</button>
        </div>
      </div>
    </template>
    <template #middleSlot>
      <div class="page-header">
        <h1>One more step</h1>
        <p class="sub-heading">{{ title }}</p>
      </div>
      <div class="page-content">
        <h3>Choose at least 1 player character:</h3>
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
        <img class="cover" :src="coverL" />
        <div class="book-info">
          <span>{{ description }}</span>
          <h3>{{ world.name }}</h3>
          <img :src="world.imageM" />
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
import CharacterInfoBox from '@/components/CharacterInfoBox.vue'
import ActionButton from '@/components/ActionButton.vue'

import { useBookStore } from '@/stores/book'
const book = useBookStore()
const { title, description, world, playableCharacters, coverL } = storeToRefs(book)

import { useOptionsStore } from '@/stores/options'
const options = useOptionsStore()

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
  book.classifyCharacters(playerSelection.value)
  await book.startBook()
  router.push('/book')
}
</script>

<style scoped>
.book-info {
  white-space: pre-line;
}
.book-info > img {
  width: 100%;
  height: auto;
  margin-bottom: 0.5rem;
  border-radius: 0.5rem;
}
.cover {
  width: 14rem;
  border-radius: 0.5rem;
}
</style>
