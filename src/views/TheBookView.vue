<template>
  <TheThirdsLayout>
    <template #leftSlot>
      <TheActionBar @talk="talk" @move="move" />
    </template>
    <template #middleSlot>
      <div class="center">
        <div class="dialog-box">
          <TheDialog />
        </div>
        <div class="message-box">
          <textarea
            ref="messageInput"
            v-model="message"
            placeholder="Next Message"
            class="next-message"
            @focus="showHints"
            @blur="hideHints"
          >
          </textarea>
          <div>
            <button class="centered" @click="sendMessage">Send</button>
          </div>
        </div>
      </div>
    </template>
    <template #rightSlot>
      <TheSettingBar />
    </template>
  </TheThirdsLayout>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'
import TheThirdsLayout from '@/layouts/TheThirdsLayout.vue'
import TheDialog from '@/components/TheDialog.vue'
import TheActionBar from '@/components/TheActionBar.vue'
import TheSettingBar from '@/components/TheSettingBar.vue'

import { useBookStore } from '@/stores/book'
const book = useBookStore()

const message = ref('')
const messageInput = ref(null)

// send on triple enter
watch(message, (newVal, oldVal) => {
  if (newVal.endsWith('\n\n\n') && newVal.length > oldVal.length) {
    sendMessage()
  }
  if (newVal.includes(':')) {
    hideHints()
  } else {
    showHints()
  }
})

const flagShowHints = ref(false)
const showHints = () => {
  if (!flagShowHints.value) {
    flagShowHints.value = true
    document.body.classList.add('flag-show-hints')
  }
}
const hideHints = () => {
  if (flagShowHints.value) {
    flagShowHints.value = false
    document.body.classList.remove('flag-show-hints')
  }
}

const command = (text) => {
  message.value = text
  nextTick(() => {
    const element = messageInput.value
    element.focus()
    element.selectionStart = element.selectionEnd = element.value.length
  })
}

const sendMessage = () => {
  book.sendMessage(message.value.trim())
  message.value = ''
}

// --- Handle Emits ---

// Characters talk
const talk = function ({ fromChar, toChar = null } = {}) {
  let text
  if (toChar === ':all') {
    text = fromChar.id + ':: '
  } else {
    text = fromChar.id + ' talk to ' + toChar.id + ': '
  }
  command(text)
}

// Move characters to location/room
const move = function ({ location = null, room = null, chars = [] } = {}) {
  let text
  if (location) {
    if (!chars.length) {
      text = 'move to location ' + location.id
    } else {
      text = chars[0].id + ' move to location ' + location.id
    }
  } else if (room) {
    if (!chars.length) {
      text = 'move to room ' + room.id
    } else {
      text = chars[0].id + ' move to room ' + room.id
    }
  }
  if (text) {
    command(text)
  }
}
</script>

<style scoped>
.center {
  height: 100%;
}
.dialog-box {
  height: calc(100% - 9rem);
  margin-bottom: 1rem;
  padding-right: 1rem;
  width: 100%;
  overflow: auto;
}
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
