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
        <TheMessageBox ref="messageBox" @activity="startNpcTimer" />
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

const book = useBookStore()
const options = useOptionsStore()

const messageBox = ref(null)

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

const move = function ({ location = null, room = null, chars = [] } = {}) {
  let text
  if (location) {
    text = chars.length
      ? chars[0].id + ' move to location ' + location.commandId
      : 'move to location ' + location.commandId
  } else if (room) {
    text = chars.length
      ? chars[0].id + ' move to room ' + room.commandId
      : 'move to room ' + room.commandId
  }
  if (text) messageBox.value?.setMessage(text)
}

// --- running NPC actions on idling

// Build looped timer for NPC actions
let npcTimeout = null
let narratorRunning = false
const startNpcTimer = () => {
  if (narratorRunning) return
  clearTimeout(npcTimeout)
  npcTimeout = setTimeout(async () => {
    narratorRunning = true
    await book.narrator.run()
    narratorRunning = false
    startNpcTimer()
  }, options.idlingBeforeTriggerNpc * 1000)
}

// start/stop with Book view
onMounted(() => {
  startNpcTimer()
})
onUnmounted(() => {
  clearTimeout(npcTimeout)
})
</script>

<style scoped>
.center {
  height: 100%;
}
.dialog-box {
  height: calc(100% - 9rem);
  margin-bottom: 1rem;
  width: 100%;
}
</style>
