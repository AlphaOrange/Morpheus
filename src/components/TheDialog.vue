<template>
  <div class="dialog">
    <transition-group name="message" tag="div">
      <div
        v-for="(message, index) in dialog"
        :key="index"
        ref="messageEls"
        class="entry"
        :class="messageClasses(message)"
      >
        <template v-if="isMajorMessage(message)">
          <header>
            <div
              v-if="showIcon(message)"
              class="header-icon"
              :style="{ backgroundImage: `url(${headerIcon(message)})` }"
            ></div>
            <div class="header-text">
              <span>{{ headerText(message) }}</span>
              <div>
                <IconButton
                  v-if="message.removable"
                  icon="circle-xmark"
                  @click="protocol.remove(message.id)"
                />
                <span class="timestamp">{{ timestamp(message) }}</span>
              </div>
            </div>
          </header>
          <main class="message-box" v-html="renderMarkdown(messageText(message))"></main>
        </template>
        <template v-else>
          <img class="minor-icon" :src="structuralIcon(message)" />
          <span>{{ messageText(message) }}</span>
        </template>
      </div>
    </transition-group>
    <div v-if="options.narratorRunning" class="temp-message">
      <div class="loader"></div>
      {{ options.narratorRunningMessage }}
    </div>
  </div>
</template>

<script setup>
import { watch, nextTick, ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { formatTime } from '@/helpers/utils'
import IconButton from '@/components/IconButton.vue'

import { useBookStore } from '@/stores/book'
import { useOptionsStore } from '@/stores/options'
const bookStore = useBookStore()
const { characters, rooms, protocol } = storeToRefs(bookStore)
const options = useOptionsStore()

import MarkdownIt from 'markdown-it'
const md = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: false,
  typographer: false,
})

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
    const removable = message.type === 'error'
    enhancedDialog.push({ ...message, removable })
  })
  const lastMessage = enhancedDialog[enhancedDialog.length - 1]
  if (lastMessage.type === 'talk') {
    lastMessage.removable = true
  }
  return enhancedDialog
})

const isMajorMessage = (message) => {
  return message.type !== 'structural'
}

const messageClasses = (message) => {
  const classes = ['message-' + message.type]
  if (message.room) {
    if (message.room === bookStore.room.id) {
      classes.push('current-room')
    } else {
      classes.push('different-room')
    }
  }
  if (isMajorMessage(message)) {
    classes.push('message')
  } else {
    classes.push('minor-message')
  }
  return classes
}

const showIcon = (message) => {
  return message.type === 'talk'
}

const headerIcon = (message) => {
  return characters.value[message.from].imageS
}
const structuralIcon = (message) => {
  if (message.spec === 'room') {
    const room = rooms.value[message.room]
    return room.imageS
  }
}

const headerText = (message) => {
  if (message.type === 'talk') {
    let charFrom = characters.value[message.from].name
    let charTo = message.to === ':all' ? 'all' : characters.value[message.to].name
    return `${charFrom} to ${charTo}:`
  } else if (message.type === 'hint') {
    let charTo = message.to === ':all' ? 'all' : characters.value[message.to].name
    return `Hint for ${charTo}:`
  } else if (message.type === 'info') {
    return message.title
  } else if (message.type === 'system') {
    return `System:`
  } else if (message.type === 'error') {
    return `Error: ${message.title}`
  } else {
    return 'Error: entry invalid'
  }
}
const messageText = (message) => {
  if (isMajorMessage(message)) {
    return message.text
  }
  if (message.type === 'structural') {
    if (message.spec === 'room') {
      const room = rooms.value[message.room]
      return `${room.name} (${room.location.name})`
    }
  } else {
    return 'Error: entry invalid'
  }
}
const timestamp = (message) => {
  return formatTime(bookStore.toGametime(message.time))
}

// Render conversation texts from Markdown to HTML
const renderMarkdown = (text) => {
  return md.render(text || '')
}

const scrollToEnd = async () => {
  await nextTick()
  const messages = messageEls.value
  if (!messages.length) return
  const lastMessage = messages[messages.length - 1]
  lastMessage.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  })
}

// Watcher: scroll to start of new message when added
const messageEls = ref([])
watch(() => [dialog.value.length, options.narratorRunning], scrollToEnd, { flush: 'post' })

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

.message,
.minor-message {
  width: 100%;
  overflow: hidden;
  transition: opacity 0.2s ease-out;
}

.message {
  margin: 0 0 1rem;
  border-radius: 0.5rem;
}

.message:last-child {
  margin: 0;
}

.minor-message {
  margin: 0 0 1rem;
  display: grid;
  grid-template-columns: max-content 1fr;
  grid-template-rows: 1.5rem;
  align-items: center;
  gap: 0.5rem;
  color: var(--col-font-toned);
}

.message-talk {
  background: var(--bg-highlight);
}

.message-hint {
  background: var(--bg-box);
}

.message-info {
  background: var(--bg-box);
}

.message-system {
  background: var(--bg-system);
}

.message-error {
  background: var(--bg-error);
}

.different-room {
  opacity: 0.1;
}

header {
  height: 2rem;
  width: 100%;
  background: rgba(0, 0, 0, 0.7);
  overflow: hidden;
}

.header-icon {
  display: block;
  float: left;
  height: 2rem;
  width: 2rem;
  background-size: cover;
  background-position: center center;
}

.header-text {
  display: flex;
  justify-content: space-between;
  height: 2rem;
  padding: 0.5rem;
}

.timestamp {
  margin-left: 0.5rem;
  color: var(--col-font-blur);
}

main {
  width: 100%;
  padding: 0 1rem;
}

main:last-child {
  margin: 0;
}

.minor-icon {
  display: block;
  float: left;
  height: 1.5rem;
  width: auto;
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
