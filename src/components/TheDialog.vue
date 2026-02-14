<template>
  <div class="dialog">
    <div
      v-for="(message, index) in protocol.dialog"
      :key="index"
      ref="messageEls"
      class="message"
      :class="messageClasses(message)"
    >
      <header>
        <div
          v-if="showIcon(message)"
          class="header-icon"
          :style="{ backgroundImage: `url(images/S/${headerIcon(message)})` }"
        ></div>
        <div class="header-text">
          <span>{{ headerText(message) }}</span>
          <span class="timestamp">{{ timestamp(message) }}</span>
        </div>
      </header>
      <main class="message-box" v-html="renderMarkdown(message.text)"></main>
    </div>
  </div>
</template>

<script setup>
import { watch, nextTick, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { formatTime } from '@/helpers/utils'

import { useBookStore } from '@/stores/book'
const bookStore = useBookStore()
const { characters, protocol } = storeToRefs(bookStore)

import MarkdownIt from 'markdown-it'
const md = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: false,
  typographer: false,
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
  return classes
}

const showIcon = (message) => {
  return message.type === 'talk'
}

const headerIcon = (message) => {
  return characters.value[message.from].image
}
const headerText = (message) => {
  if (message.type === 'talk') {
    let charFrom = characters.value[message.from].name
    let charTo = message.to === ':all' ? 'all' : characters.value[message.to].name
    return `${message.scene}| ${charFrom} to ${charTo}:`
  } else if (message.type === 'hint') {
    let charTo = message.to === ':all' ? 'all' : characters.value[message.to].name
    return `${message.scene}| Hint for ${charTo}:`
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
const timestamp = (message) => {
  return formatTime(bookStore.toGametime(message.time))
}

// Render conversation texts from Markdown to HTML
const renderMarkdown = (text) => {
  return md.render(text || '')
}

// Watcher: scroll to start of new message when added
const messageEls = ref([])
watch(
  () => protocol.value.dialog.length,
  async () => {
    await nextTick()
    const messages = messageEls.value
    if (!messages.length) return
    const lastMessage = messages[messages.length - 1]
    lastMessage.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  },
  { flush: 'post' },
)
</script>

<style scoped>
.dialog {
  height: 100%;
  padding-right: 1rem;
  overflow-y: auto;
  scrollbar-color: var(--bg-highlight) var(--bg-page);
  scrollbar-width: thin;
}

.message {
  width: 100%;
  margin: 0 0 1rem;
  border-radius: 0.5rem;
  overflow: hidden;
}
.message:last-child {
  margin: 0;
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
  color: var(--col-font-blur);
}

main {
  width: 100%;
  padding: 0 1rem;
}

main:last-child {
  margin: 0;
}
</style>
