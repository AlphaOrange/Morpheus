<template>
  <div class="vertical-center-flex">
    <div v-if="showTopBox" class="box">
      <div v-if="movingchars" class="shelf horizontal-flex">
        <CharacterMarker
          v-for="char in movingPlayerCharacters"
          :key="char.id"
          :character="char"
          :icon="`person-walking`"
          :text="periodText(char.action.until - time)"
        />
      </div>
      <div v-if="multiroom" class="shelf horizontal-flex item-selection">
        <div
          v-for="room in activeRooms"
          :key="room.id"
          class="room-button"
          :class="roomButtonClass(room)"
          @click="switchTo(room)"
        >
          <img :src="`${room.imageS}`" alt="" />
          <div class="player-number">{{ room.numberOfPlayers }}</div>
        </div>
      </div>
    </div>
    <div v-if="room.availablePlayerCharacters.length > 1" class="box">
      <h3>Group</h3>
      <div class="button-list">
        <ActionButton
          v-for="avRoom in room.availableRooms"
          :key="avRoom.id"
          @click="moveToRoom(avRoom)"
          :text="avRoom.name"
          icon="door-open"
          :pill="pilltext(distancePeriodText(room, avRoom))"
          :hint="avRoom.commandId"
          :compact="compact"
        />
        <ActionButton
          v-for="location in room.availableLocations"
          :key="location.id"
          @click="moveToLocation(location)"
          :text="location.name"
          icon="person-walking"
          :pill="pilltext(distancePeriodText(room, location))"
          :hint="location.commandId"
          :compact="compact"
        />
        <ActionButton
          v-if="room.hasAction('sleep')"
          @click="sleep60()"
          text="Sleep 1 Hour"
          icon="moon"
          pill="1h"
          :compact="compact"
        />
      </div>
    </div>
    <div v-for="char in room.availablePlayerCharacters" :key="char.id" class="box">
      <h3 class="hint-anchor">
        <span v-if="activePlayerID === char.id"><font-awesome-icon icon="fa-star" /></span>
        {{ char.name }}<span class="hint">{{ char.id }}</span>
      </h3>
      <div class="button-list">
        <ActionButton
          v-if="room.numberOfPlayers + room.numberOfAis > 2"
          @click="talkToAll(char)"
          :text="'Talk to all'"
          :icon="'comment'"
          :compact="compact"
        />
        <ActionButton
          v-for="partner in room.availableAiCharacters"
          :key="partner.id"
          @click="talkTo(char, partner)"
          :text="`Talk to ${partner.name}`"
          :icon="'comments'"
          :compact="compact"
        />
        <ActionButton
          v-for="avRoom in room.availableRooms"
          :key="avRoom.id"
          @click="moveCharToRoom(char, avRoom)"
          :text="avRoom.name"
          :icon="'door-open'"
          :pill="pilltext(distancePeriodText(room, avRoom))"
          :compact="compact"
        />
        <ActionButton
          v-for="location in room.availableLocations"
          :key="location.id"
          @click="moveCharToLocation(char, location)"
          :text="location.name"
          :icon="'person-walking'"
          :pill="pilltext(distancePeriodText(room, location))"
          :compact="compact"
        />
        <ActionButton
          v-if="room.hasAction('sleep')"
          @click="sleep60(char)"
          text="Sleep 1 Hour"
          icon="moon"
          pill="1h"
          :compact="compact"
        />
      </div>
    </div>
    <div v-for="char in room.busyPlayerCharacters" :key="char.id" class="box">
      <h3 class="hint-anchor">
        {{ char.name }}<span class="hint">{{ char.id }}</span>
      </h3>
      <div class="busy-info">Currently {{ busyText(char.action.type) }}</div>
    </div>
    <div class="box">
      <h3>User Actions</h3>
      <div class="button-list">
        <ActionButton @click="runNarrator" text="Run NPCs" icon="circle-play" :compact="compact" />
        <ActionButton @click="save" text="Save Book" icon="bookmark" :compact="compact" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { periodText, distancePeriodText } from '@/helpers/utils'
import CharacterMarker from '@/components/CharacterMarker.vue'
import ActionButton from '@/components/ActionButton.vue'

import { useBookStore } from '@/stores/book'
const book = useBookStore()

import { useOptionsStore } from '@/stores/options'
const options = useOptionsStore()

const { activeRooms, movingPlayerCharacters, activePlayerID, time, room } = storeToRefs(book)
const emits = defineEmits(['talk', 'move', 'sleep', 'runNarrator', 'save'])

const switchTo = (room) => {
  book.switchTo(room)
}

const pilltext = (distText) => {
  return distText === '0s' ? null : distText
}

const busyText = (action) => {
  if (action === 'sleep') {
    return 'sleeping'
  }
  return ''
}

const compact = computed(() => {
  const numChars = room.value.availablePlayerCharacters.length
  const numPlaces = room.value.availableRooms.length + room.value.availableLocations.length
  const numNPCs = room.value.availableAiCharacters.length
  const group = room.value.availablePlayerCharacters.length > 1 ? 1 : 0
  const numButtons = (numChars + group) * numPlaces + numChars * numNPCs
  return numButtons >= options.compactButtonsThreshold
})

// Emit actions
const talkToAll = (char) => {
  emits('talk', { fromChar: char, toChar: ':all' })
}
const talkTo = (char, partner) => {
  emits('talk', { fromChar: char, toChar: partner })
}
const moveToRoom = (room) => {
  emits('move', { room: room })
}
const moveToLocation = (location) => {
  emits('move', { location: location })
}
const moveCharToRoom = (char, room) => {
  emits('move', { room: room, chars: [char] })
}
const moveCharToLocation = (char, location) => {
  emits('move', { location: location, chars: [char] })
}
const sleep60 = (char = null) => {
  emits('sleep', { char, duration: 60 })
}

// Emit meta commands
const runNarrator = () => {
  emits('runNarrator')
}
const save = () => {
  emits('save')
}

const multiroom = computed(() => activeRooms.value.length > 1)
const movingchars = computed(() => movingPlayerCharacters.value.length > 0)
const showTopBox = computed(() => multiroom.value || movingchars.value)
const roomButtonClass = (room) => {
  if (room.id === book.roomId) {
    return ['selected-toned']
  } else {
    return []
  }
}
</script>

<style scoped>
* {
  user-select: none;
}
.room-button {
  position: relative;
  height: 2rem;
  border-radius: 0.5rem;
  background-size: cover !important;
  background-position: center center !important;
  overflow: hidden;
}
.room-button img {
  height: 100%;
}
.room-button .player-number {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  height: 1rem;
  width: 1rem;
  padding: 1px 0 0;
  border-radius: 0.5rem;
  font-size: 0.8rem;
  text-align: center;
  background: var(--bg-highlight);
}
.busy-info {
  font-style: italic;
  color: var(--col-font-toned);
}
</style>
