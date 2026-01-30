<template>
  <div class="vertical-center-flex">
    <div v-if="showTopBox" class="box action-box">
      <div v-if="movingchars" class="shelf horizontal-flex">
        <CharacterMarker
          v-for="char in movingPlayerCharacters"
          :key="char.id"
          :character="char"
          :icon="`person-walking`"
          :text="periodText(char.arrivalTime - time)"
        />
      </div>
      <div v-if="multiroom" class="shelf horizontal-flex item-selection">
        <div v-for="room in activeRooms" :key="room.id" class="room-button" @click="switchTo(room)">
          <img :src="`images/S/${room.image}`" alt="" />
          <div class="player-number">{{ room.numberOfPlayers }}</div>
        </div>
      </div>
    </div>
    <div class="box action-box">
      <h3>Group</h3>
      <ActionButton
        v-for="avRoom in room.availableRooms"
        :key="avRoom.id"
        @click="moveToRoom(avRoom)"
        :text="avRoom.name"
        :icon="'door-open'"
        :pill="distancePeriodText(room, avRoom)"
        :hint="avRoom.id"
      />
      <ActionButton
        v-for="location in room.availableLocations"
        :key="location.id"
        @click="moveToLocation(location)"
        :text="location.name"
        :icon="'person-walking'"
        :pill="distancePeriodText(room, location)"
        :hint="location.id"
      />
    </div>
    <div v-for="char in room.presentPlayerCharacters" :key="char.id" class="box action-box">
      <h3 class="hint-anchor">
        <span v-if="activePlayerID === char.id"><font-awesome-icon icon="fa-star" /></span>
        {{ char.name }}<span class="hint">{{ char.id }}</span>
      </h3>
      <ActionButton @click="talkToAll(char)" :text="'Talk to all'" :icon="'comment'" />
      <br v-if="room.presentAiCharacters" />
      <ActionButton
        v-for="partner in room.presentAiCharacters"
        :key="partner.id"
        @click="talkTo(char, partner)"
        :text="`Talk to ${partner.name}`"
        :icon="'comments'"
      />
      <ActionButton
        v-for="avRoom in room.availableRooms"
        :key="avRoom.id"
        @click="moveCharToRoom(char, avRoom)"
        :text="avRoom.name"
        :icon="'door-open'"
        :pill="distancePeriodText(room, avRoom)"
      />
      <ActionButton
        v-for="location in room.availableLocations"
        :key="location.id"
        @click="moveCharToLocation(char, location)"
        :text="location.name"
        :icon="'person-walking'"
        :pill="distancePeriodText(room, location)"
      />
    </div>
    <div class="box action-box">
      <h3>Debug / Test</h3>
      <ActionButton @click="debug_addTime()" :text="`+1min`" />
      <ActionButton @click="debug_save()" :text="`Save`" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { periodText, distancePeriodText } from '@/helpers/utils'
import CharacterMarker from '@/components/CharacterMarker.vue'
import ActionButton from '@/components/ActionButton.vue'

import { useShelfStore } from '@/stores/shelf'
const shelf = useShelfStore()
import { useBookStore } from '@/stores/book'
const book = useBookStore()

const { activeRooms, movingPlayerCharacters, activePlayerID, time, room } = storeToRefs(book)
const emits = defineEmits(['talk', 'move'])

const switchTo = (room) => {
  book.switchTo(room)
}

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

const multiroom = computed(() => activeRooms.value.length > 1)
const movingchars = computed(() => movingPlayerCharacters.value.length > 0)
const showTopBox = computed(() => multiroom.value || movingchars.value)

// DEBUG: ADD 1 MINUTE
const debug_addTime = () => {
  book.addTime(60)
}
// DEBUG: SAVE GAME
const debug_save = () => {
  shelf.saveBook()
}
</script>

<style scoped>
* {
  user-select: none;
}
.action-box {
  padding: 0.5rem;
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
</style>
