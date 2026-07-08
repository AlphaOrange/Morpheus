<template>
  <TheThirdsLayout>
    <template #leftSlot>
      <div class="vertical-flex">
        <RouterLink to="/library">
          <ActionButton text="Back To Library" icon="arrow-left" />
        </RouterLink>
        <div class="box">
          <h3>AI Configuration</h3>
          <label for="selectAiVendor">Model Name:</label>
          <select
            :value="options.aiVendor"
            @change="options.setOption('aiVendor', $event.target.value)"
            id="selectAiVendor"
            class="long"
          >
            <option v-for="vendor in Object.keys(models)" :key="vendor">{{ vendor }}</option>
          </select>
          <div class="input-group">
            <input type="checkbox" id="idLegalAllowAI" v-model="options.legalAllowAI" />
            <label for="idLegalAllowAI"
              >I consent to the transfer of data to the selected AI service provider</label
            >
          </div>
          <div v-if="options.aiApiKey !== '' && !options.legalAllowAI" class="box warning-box">
            <div>You did not yet give permission to send your data to the AI service provider.</div>
          </div>
          <label for="selectAiVersion">Model Version:</label>
          <select v-model="options.aiModel" id="selectAiVersion" class="long">
            <option v-for="model in models[options.aiVendor]" :key="model">{{ model }}</option>
          </select>
          <h3>API Key:</h3>
          <input
            type="text"
            v-model="options.aiApiKey"
            placeholder="insert valid key"
            class="long"
          />
          <div v-if="options.aiApiKey !== '' && !apiKeyValid" class="box warning-box">
            <div>⚠️ Your API key seems to be not valid.</div>
          </div>
          <div v-if="options.aiApiKey !== '' && apiKeyValid" class="box success-box">
            <div>✅ Your API key works fine!</div>
          </div>
          <div v-if="options.aiApiKey === ''" class="box warning-box">
            <div>
              ⚠️ You did not yet enter an API key. Without LLM model connection functionality is
              extremely limited!
            </div>
          </div>
          <div class="input-group">
            <input type="checkbox" id="idAiApiKeyAllowSave" v-model="options.aiApiKeyAllowSave" />
            <label for="idAiApiKeyAllowSave">Store key with savegame</label>
          </div>
        </div>
        <div class="box">
          <h3>Book Options</h3>
          <div class="input-group">
            <template v-for="option in protobook.options" :key="option.tag">
              <input type="checkbox" :id="`idBookOption_${option.tag}`" />
              <label :for="`idBookOption_${option.tag}`">{{ option.description }}</label>
              <br />
            </template>
          </div>
        </div>
        <div class="box">
          <h3>Game Features</h3>
          <div class="input-group">
            <input type="checkbox" id="idUsePlayerStates" v-model="options.usePlayerStates" />
            <label for="idUsePlayerStates">Player Character States</label>
            <br />
            <input type="checkbox" id="idUseAiStates" v-model="options.useAiStates" />
            <label for="idUseAiStates">AI Character States</label>
            <br />
            <input
              type="checkbox"
              id="idUseAiForSavegameSummary"
              v-model="options.useAiForSavegameSummary"
            />
            <label for="idUseAiForSavegameSummary">Use AI for savegame summaries</label>
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
        <p class="sub-heading">{{ protobook.title }}</p>
      </div>
      <div class="page-content">
        <h3>{{ headlineChooseChars }}</h3>
        <div class="horizontal-flex item-selection">
          <CharacterSetupBox
            v-for="char in protobook.playableCharacters"
            :character="char"
            :bookId="protobook.id"
            :key="char"
            :class="isSelected(char.id)"
            @click="selectPlayer(char.id)"
          />
        </div>
      </div>
    </template>
    <template #rightSlot>
      <div class="vertical-center-flex">
        <img class="cover" :src="protobook.coverImage" />
        <div class="book-info">
          <span>{{ protobook.description }}</span>
          <h3>{{ protobook.world.name }}</h3>
          <img :src="protobook.worldImage" />
          {{ protobook.world.description }}
        </div>
      </div>
    </template>
  </TheThirdsLayout>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import TheThirdsLayout from '@/layouts/TheThirdsLayout.vue'
import CharacterSetupBox from '@/components/CharacterSetupBox.vue'
import ActionButton from '@/components/ActionButton.vue'
import { models } from '@/data/llm'
import { debounce } from '@/helpers/utils'
import Agent from '@/agents/Agent'

import { useShelfStore } from '@/stores/shelf'
const shelf = useShelfStore()
const { protobook } = storeToRefs(shelf)

import { useOptionsStore } from '@/stores/options'
const options = useOptionsStore()

import { useRouter } from 'vue-router'
const router = useRouter()

const playerSelection = ref(new Set()) // selected player characters
const apiKeyValid = ref(false)

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

// Character Choosing headline depending on allowed number of characters
const headlineChooseChars = computed(() => {
  if (protobook.value.settings.minPlayerChars === protobook.value.settings.maxPlayerChars) {
    if (protobook.value.settings.minPlayerChars === 1) {
      return 'Choose your player character:'
    } else {
      return `Choose ${protobook.value.settings.minPlayerChars} player characters:`
    }
  } else {
    if (protobook.value.settings.maxPlayerChars === 99) {
      if (protobook.value.settings.minPlayerChars === 1) {
        return `Choose at least 1 player character:`
      } else {
        return `Choose at least ${protobook.value.settings.minPlayerChars} player characters:`
      }
    } else {
      return `Choose ${protobook.value.settings.minPlayerChars} to ${protobook.value.settings.maxPlayerChars} player characters:`
    }
  }
})

// Check if API key is correct
const testAgent = new Agent()
const apiCheck = debounce(async () => {
  apiKeyValid.value = await testAgent.checkApi()
}, 500)
onMounted(apiCheck)
watch(() => options.aiApiKey, apiCheck)

// Check if settings are okay and user may start book
const checkConditions = computed(() => {
  return (
    playerSelection.value.size >= protobook.value.settings.minPlayerChars &&
    playerSelection.value.size <= protobook.value.settings.maxPlayerChars
  )
})

// Start the book
const startBook = async () => {
  // collect options
  // create book
  // set options
  // start book
  // router push
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
