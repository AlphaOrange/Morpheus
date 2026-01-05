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
        <TheMessageBox ref="messageBox" />
      </div>
    </template>
    <template #rightSlot>
      <TheSettingBar />
    </template>
  </TheThirdsLayout>
</template>

<script setup>
import { ref } from 'vue'
import TheThirdsLayout from '@/layouts/TheThirdsLayout.vue'
import TheDialog from '@/components/TheDialog.vue'
import TheMessageBox from '@/components/TheMessageBox.vue'
import TheActionBar from '@/components/TheActionBar.vue'
import TheSettingBar from '@/components/TheSettingBar.vue'

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
      ? chars[0].id + ' move to location ' + location.id
      : 'move to location ' + location.id
  } else if (room) {
    text = chars.length ? chars[0].id + ' move to room ' + room.id : 'move to room ' + room.id
  }
  if (text) messageBox.value?.setMessage(text)
}
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
