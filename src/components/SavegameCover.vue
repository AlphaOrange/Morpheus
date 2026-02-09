<template>
  <div class="book" :style="{ backgroundImage: `url(images/L/${cover})` }">
    <div class="shade">
      <div class="bookmark">BOOKMARK</div>
      <header>
        <div class="title">{{ saveData.book.title }}</div>
        <div class="description">{{ truncateString(saveData.book.description, 108) }}</div>
      </header>
      <footer>
        <div class="room" :style="{ backgroundImage: `url(images/S/${roomImage})` }">
          {{ roomData.name }}
        </div>
        <div class="characters">
          <div
            class="character"
            v-for="char in chars"
            :key="char.id"
            :style="{ backgroundImage: `url(images/S/${charImage(char)})` }"
          >
            {{ char.name }}
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { truncateString } from '@/helpers/utils'

const props = defineProps({
  saveData: {
    type: Object,
    required: true,
  },
})

const cover = computed(() => {
  return props.saveData.book._cover === '' ? 'generic_cover.jpg' : props.saveData.book._cover
})

const roomData = computed(() => {
  const roomPath = props.saveData.book.roomId.split('/')
  return props.saveData.book.destinations[roomPath[0]].locations[roomPath[0] + '/' + roomPath[1]]
    .rooms[props.saveData.book.roomId]
})

const roomImage = computed(() => {
  return roomData.value._image === '' ? 'generic_room.jpg' : roomData.value._image
})

const chars = computed(() => {
  return Object.values(props.saveData.book.playerCharacters)
    .map((charId) => props.saveData.book.characters[charId])
    .slice(0, 3)
})

const charImage = (char) => {
  if (char._image === '') {
    if (['male', 'female'].includes(char.gender)) {
      return `generic_${char.gender}.jpg`
    } else {
      return `generic_diverse.jpg`
    }
  } else {
    return char._image
  }
}
</script>

<style scoped>
.book {
  position: relative;
  width: 100%;
  max-width: 18rem;
  aspect-ratio: 3 / 4;
  border-radius: 0.5rem;
  background-position: center center;
  background-size: cover;
  overflow: hidden;
}
.shade {
  position: relative;
  width: 100%;
  height: 100%;
  background: var(--bg-darkshade);
}
.bookmark {
  width: 2.5rem;
  height: 8rem;
  position: absolute;
  top: 0;
  left: 1rem;
  padding: 0.5rem 0 0 0.8rem;
  background: var(--bg-highlight);
  clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 85%, 0 100%);
  writing-mode: vertical-lr;
  text-orientation: sideways;
}

header {
  padding: 0.5rem 0.5rem 0.75rem 4rem;
  max-height: 8rem;
  overflow-y: hidden;
}
.title {
  text-align: center;
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
  font-weight: 700;
}
.description {
  text-align: center;
  font-size: 1rem;
}
footer {
  position: absolute;
  bottom: 0.5rem;
  left: 0.5rem;
}
.room {
  width: 8.5rem;
  aspect-ratio: 16 / 9;
  border-radius: 0.5rem;
  background-position: center center;
  background-size: cover;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  margin-bottom: 0.5rem;
  border: 2px solid var(--bg-highlight);
}
.character {
  float: left;
  width: 4rem;
  aspect-ratio: 5 / 7;
  border-radius: 0.5rem;
  background-position: center center;
  background-size: cover;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  margin: 0 0.5rem 0 0;
  border: 2px solid var(--bg-highlight);
}
</style>
