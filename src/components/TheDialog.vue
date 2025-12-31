<template>
  <div class="dialog">
    <div
      v-for="(message, index) in protocol.dialog"
      :key="index"
      class="message"
      :class="'message-' + message.type"
    >
      <header>
        <div
          v-if="showIcon(message)"
          class="header-icon"
          :style="{ backgroundImage: `url(images/${headerIcon(message)})` }"
        ></div>
        <div class="header-text">
          {{ headerText(message) }}
        </div>
      </header>
      <main class="message-box" v-html="renderMarkdown(message.text)"></main>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
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
    return `${charFrom} to ${charTo}:`
  } else if (message.type === 'hint') {
    let charTo = message.to === ':all' ? 'all' : characters.value[message.to].name
    return `Hint for ${charTo}:`
  } else if (message.type === 'info') {
    return `Info:`
  } else if (message.type === 'system') {
    return `System:`
  } else if (message.type === 'error') {
    return `Error:`
  }
  return 'X'
}

// Render conversation texts from Markdown to HTML
const renderMarkdown = (text) => {
  console.log(text)
  return md.render(text || '')
}
</script>

<style scoped>
.message {
  width: 100%;
  margin: 0 0 1rem;
  border-radius: 0.5rem;
  overflow: hidden;
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
  display: block;
  float: left;
  height: 2rem;
  padding: 0.5rem;
}

main {
  width: 100%;
  padding: 0 1rem;
}

main:last-child {
  margin: 0;
}
</style>
