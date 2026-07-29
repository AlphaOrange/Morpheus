<template>
  <div class="dialog">
    <transition-group name="message" tag="div">
      <DialogMessage
        v-for="(message, index) in dialog"
        :key="index"
        ref="messageEls"
        class="entry"
        :message="message"
        @removeMessage="removeMessage(message)"
      ></DialogMessage>
      <DialogMessage
        v-if="protocol.stopper"
        :message="protocol.stopper"
        @answerStopper="answerStopper"
        @cancelStopper="cancelStopper"
      ></DialogMessage>
    </transition-group>
    <div v-if="options.narratorRunning" class="temp-message">
      <div class="loader"></div>
      {{ options.narratorRunningMessage }}
    </div>
  </div>
</template>

<script setup>
import { watch, nextTick, ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import DialogMessage from '@/components/DialogMessage.vue'

import { useBookStore } from '@/stores/book'
import { useOptionsStore } from '@/stores/options'
const bookStore = useBookStore()
const { protocol } = storeToRefs(bookStore)
const options = useOptionsStore()

const dialog = computed(() => {
  // Get messages from protocol
  let dialog = protocol.value.filterDialog({ types: 'show' })

  // remove hints for NPC only
  const showIds = [...Object.keys(bookStore.playerCharacters), ':all']
  dialog = dialog.filter((message) => message.type !== 'hint' || showIds.includes(message.to))

  // add room changes
  let enhancedDialog = []
  let room = ''
  dialog.forEach((message) => {
    if ('room' in message && message.room != room) {
      room = message.room
      enhancedDialog.push({ type: 'structural', spec: 'room', room: room, undo: false })
    }
    enhancedDialog.push(message)
  })
  return enhancedDialog
})

function removeMessage(message) {
  protocol.value.remove({ messageId: message.id })
}

function answerStopper({ charId, answer }) {
  protocol.value.answerStopper(charId, answer)
}

function cancelStopper() {
  protocol.value.cancelStopper()
}

// Scroll To Last Message

const initialized = ref(false)
const messageEls = ref([])

// Scroll Function
const scrollToEnd = async (smooth = true) => {
  await nextTick()
  const messages = messageEls.value
  if (!messages.length) return
  const lastMessage = messages[messages.length - 1]
  lastMessage.$el.scrollIntoView({
    behavior: smooth ? 'smooth' : 'auto',
    block: 'start',
  })
}

// Scroll to end on mount
onMounted(async () => {
  await scrollToEnd(false) // jump instantly
  initialized.value = true
})

// Watcher: scroll to start of new message when added
watch(() => [dialog.value.length, options.narratorRunning], scrollToEnd, { flush: 'post' })
watch(
  () => [dialog.value.length, options.narratorRunning],
  () => {
    if (!initialized.value) return
    scrollToEnd(true)
  },
  { flush: 'post' },
)

// expose scrolling to outer components
defineExpose({ scrollToEnd })
</script>

<style scoped>
.dialog {
  height: 100%;
  padding-right: 1rem;
  overflow-y: auto;
  scrollbar-color: var(--bg-highlight) var(--bg-page);
  scrollbar-width: thin;
}

.entry {
  margin: 0 0 1rem;
}

.temp-message {
  width: 100%;
  padding: 0.5rem;
  margin: 1rem 0 0;
  border-radius: 0.5rem;
  background: var(--bg-page);
}
.temp-message::after {
  content: '';
  clear: both;
  display: table;
}
</style>
