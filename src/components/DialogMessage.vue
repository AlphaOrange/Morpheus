<template>
  <div :class="messageClasses(message)">
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
      <main>
        <div class="formatted-message" v-html="renderMarkdown(messageText(message))"></div>
        <div v-if="isStopper" class="stopper button-list">
          <template v-for="charId in message.to" :key="charId">
            <ActionButton :text="`${characters[charId].name} accepts`"></ActionButton>
            <ActionButton :text="`${characters[charId].name} declines`"></ActionButton>
          </template>
        </div>
      </main>
    </template>
    <template v-else>
      <img class="minor-icon" :src="structuralIcon(message)" />
      <span>{{ messageText(message) }}</span>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { formatTime, joinAnd } from '@/helpers/utils'
import IconButton from '@/components/IconButton.vue'
import ActionButton from '@/components/ActionButton.vue'
import { useBookStore } from '@/stores/book'
const bookStore = useBookStore()
const { characters, rooms } = storeToRefs(bookStore)

import MarkdownIt from 'markdown-it'
const md = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: false,
  typographer: false,
})

const props = defineProps({
  message: {
    type: Object,
    required: true,
  },
})

const isMajorMessage = (message) => {
  return message.type !== 'structural'
}

const isStopper = computed(() => {
  return props.message.type === 'stopper'
})

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
  return ['talk', 'stopper'].includes(message.type)
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
  } else if (message.type === 'stopper') {
    let charFrom = characters.value[message.from].name
    return `${charFrom} has a request`
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
  if (message.time) {
    return formatTime({ datetime: bookStore.toGametime(message.time) })
  }
  return ''
}

// Render conversation texts from Markdown to HTML
const renderMarkdown = (text) => {
  return md.render(text || '')
}
</script>

<style scoped>
.message,
.minor-message {
  width: 100%;
  overflow: hidden;
  transition: opacity 0.2s ease-out;
}

.message {
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

.message-stopper {
  background: var(--bg-page);
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
  padding: 1rem;
}

.stopper {
  margin-top: 1rem;
  margin-bottom: -0.5rem;
}

.minor-icon {
  display: block;
  float: left;
  height: 1.5rem;
  width: auto;
}
</style>
