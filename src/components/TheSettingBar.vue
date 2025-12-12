<template>
  <div class="vertical-center-flex">
    <TimeBox />
    <SettingBox :hint="'Destination'" :setting="destination" :collapsed="true" />
    <SettingBox :hint="'Location'" :setting="location" :collapsed="true" />
    <SettingBox :hint="'Room'" :setting="room" :collapsed="false" />
    <div class="vertical-center-flex">
      <CharacterInfoBox
        v-for="character in room.presentAiCharacters"
        :key="character.id"
        :character="character"
        :collapsed="true"
        :collapsible="true"
      />
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import TimeBox from '@/components/TimeBox.vue'
import SettingBox from '@/components/SettingBox.vue'
import CharacterInfoBox from '@/components/CharacterInfoBox.vue'
import { useBookStore } from '@/stores/book'
const book = useBookStore()
const { destination, location, room } = storeToRefs(book)
</script>

<style scoped>
* {
  user-select: none;
}
</style>
