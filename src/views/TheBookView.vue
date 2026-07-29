<template>
  <TheThirdsLayout>
    <template #leftSlot>
      <div v-if="options.aiApiKey === ''" class="box warning-box">
        <div>
          You did not yet enter an API key. Without LLM model connection functionality is extremely
          limited!
        </div>
      </div>
      <TheActionBar
        :narratorRunning="narratorRunning"
        @talk="talk"
        @move="move"
        @sleep="sleep"
        @wake="wake"
        @runNarrator="manualNarrator"
        @stopNarrator="stopNarrator"
        @save="save"
      />
    </template>
    <template #middleSlot>
      <div class="center">
        <div class="dialog-box">
          <TheDialog ref="dialog" @answerStopper="answerStopper" />
        </div>
        <TheMessageBox
          ref="messageBox"
          @activity="startNpcTimer"
          @runNarrator="manualNarrator"
          @stopNarrator="stopNarrator"
          @save="save"
          @undo="undo"
          @answerStopper="answerStopper"
        />
      </div>
    </template>
    <template #rightSlot>
      <TheSettingBar />
    </template>
  </TheThirdsLayout>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import TheThirdsLayout from '@/layouts/TheThirdsLayout.vue'
import TheDialog from '@/components/TheDialog.vue'
import TheMessageBox from '@/components/TheMessageBox.vue'
import TheActionBar from '@/components/TheActionBar.vue'
import TheSettingBar from '@/components/TheSettingBar.vue'
import { useBookStore } from '@/stores/book'
import { useOptionsStore } from '@/stores/options'
import { useShelfStore } from '@/stores/shelf'

const book = useBookStore()
const options = useOptionsStore()
const shelf = useShelfStore()

const dialog = ref(null)
const messageBox = ref(null)
const narratorRunning = ref(false)

// --- Commands that manipulate the message box ---
const talk = function ({ fromChar, toChar = null } = {}) {
  let text
  if (toChar === ':all') {
    text = fromChar.id + ':: '
  } else {
    text = fromChar.id + ' talk to ' + toChar.id + ': '
  }
  messageBox.value?.setMessage(text)
}

// move + travel
const move = function ({ destination = null, location = null, room = null, char = null } = {}) {
  let text
  if (location) {
    text = char
      ? char.id + ' move to location ' + location.commandId
      : 'move to location ' + location.commandId
  } else if (room) {
    text = char ? char.id + ' move to room ' + room.commandId : 'move to room ' + room.commandId
  } else if (destination) {
    text = char
      ? char.id + ' travel to ' + destination.commandId
      : 'travel to ' + destination.commandId
  }
  if (text) messageBox.value?.setMessage(text)
}

const sleep = function ({ char, duration }) {
  const text = char ? `${char.id} sleep ${duration}` : `sleep ${duration}`
  messageBox.value?.setMessage(text)
}
const wake = function ({ fromChar, toChar }) {
  const text = fromChar.id + ' wake ' + toChar.id + ': '
  messageBox.value?.setMessage(text)
}

// --- meta commands ---

const save = () => {
  shelf.saveBook()
}

const undo = () => {
  if (book.protocol.hasStopper()) {
    book.protocol.cancelStopper()
  } else {
    book.protocol.remove({})
  }
}

const answerStopper = ({ charId, answer }) => {
  if (charId) {
    book.protocol.answerStopper(charId, answer)
  } else {
    book.room.availablePlayerCharacters.forEach((char) => {
      book.protocol.answerStopper(char.id, answer)
    })
  }
}

// --- running NPC actions on idling

// Start and block NPC narrator
const runNarrator = async function ({ force = false } = {}) {
  narratorRunning.value = true
  await book.narrator.run({ force })
  narratorRunning.value = false
  startNpcTimer()
}

// Looped timer for automatic NPC actions
let npcTimeout = null
const startNpcTimer = () => {
  if (narratorRunning.value) return
  clearTimeout(npcTimeout)
  npcTimeout = setTimeout(runNarrator, options.idlingBeforeTriggerNpc * 1000)
}

// Manual NPC actions
const manualNarrator = () => {
  if (narratorRunning.value) return
  runNarrator({ force: true })
}

const stopNarrator = () => {
  clearTimeout(npcTimeout) // prevent subsequent narrator runs
  book.narrator.stop() // stop narrator from executing current action
}

// start/stop with Book view, focus message box on entry
onMounted(() => {
  startNpcTimer()
  dialog.value?.scrollToEnd()
  messageBox.value?.focus()
})
onUnmounted(() => {
  clearTimeout(npcTimeout)
})
</script>

<style scoped>
.warning-box {
  margin-bottom: 1rem;
}
.center {
  height: 100%;
}
.dialog-box {
  height: calc(100% - 9rem);
  margin-bottom: 1rem;
  width: 100%;
}
</style>
