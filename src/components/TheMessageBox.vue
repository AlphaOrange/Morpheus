<template>
  <div class="message-box">
    <textarea
      ref="textarea"
      v-model="message"
      class="next-message"
      placeholder="Next Message"
      @focus="onFocus"
      @blur="onBlur"
    ></textarea>
    <div>
      <button class="centered" @click="send">Send</button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useBookStore } from '@/stores/book'
import { useOptionsStore } from '@/stores/options'

const book = useBookStore()
const options = useOptionsStore()

const message = ref('')
const textarea = ref(null)

// --- Send Message ---

// Send action
const send = () => {
  const trimmed = message.value.trim()
  if (!trimmed) return
  book.sendMessage(trimmed)
  message.value = ''
}

// Send on triple-enter
watch(message, (newVal, oldVal) => {
  if (newVal.endsWith('\n\n\n') && newVal.length > oldVal.length) {
    send()
  }

  // show/hide id hints
  options.idHintsActive = !newVal.includes(':')
})

// --- Handle Focus/Blur ---

// Show/hide id hints on focus
const onFocus = () => (options.idHintsActive = true)
const onBlur = () => (options.idHintsActive = false)

const focus = () => {
  requestAnimationFrame(() => {
    const el = textarea.value
    if (!el) return

    el.focus()
    const len = el.value.length
    el.setSelectionRange(len, len)
  })
}

// --- Expose message value manipulation ---

const setMessage = (text) => {
  message.value = text
  focus()
}

const appendMessage = (text) => {
  message.value += text
  focus()
}

defineExpose({ setMessage, appendMessage, focus })
</script>

<style scoped>
.message-box {
  display: grid;
  grid-template: 100% / 1fr 6rem;
  column-gap: 1rem;
}
.next-message {
  width: 100%;
  height: 8rem;
  padding: 0.5rem 1rem;
  box-sizing: border-box;
  border: none;
  border-radius: 0.5rem;
  background: var(--bg-box);
  color: var(--col-font);
  resize: none;
}
.message-box button {
  width: 100%;
}
</style>
