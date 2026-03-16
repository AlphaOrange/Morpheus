<template>
  <div class="book" :style="{ backgroundImage: `url(${cover})` }">
    <div class="shade">
      <div class="bookmark">BOOKMARK</div>
      <header>
        <div class="title">{{ saveData.book.title }}</div>
        <div class="description">{{ truncateString(saveData.book.saveSummary, 108) }}</div>
      </header>
      <footer>
        <div class="room" :style="{ backgroundImage: `url(${roomImage})` }">
          {{ roomData.name }}
        </div>
        <div class="characters">
          <div
            class="character"
            v-for="char in chars"
            :key="char.id"
            :style="{ backgroundImage: `url(${charImage(char)})` }"
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
import { genericImg, bookImg } from '@/helpers/utils'

const props = defineProps({
  saveData: {
    type: Object,
    required: true,
  },
})

const cover = computed(() => {
  if (props.saveData.book._cover) {
    return bookImg({
      filename: props.saveData.book._cover,
      size: 'L',
      bookId: props.saveData.book.id,
    })
  } else {
    return genericImg({ filename: 'generic_cover.jpg', size: 'L' })
  }
})

const roomData = computed(() => {
  const roomPath = props.saveData.book.roomId.split('/')
  return props.saveData.book.destinations[roomPath[0]].locations[roomPath[0] + '/' + roomPath[1]]
    .rooms[props.saveData.book.roomId]
})

const roomImage = computed(() => {
  if (roomData.value._image) {
    return bookImg({
      filename: roomData.value._image,
      size: 'L',
      bookId: props.saveData.book.id,
    })
  } else {
    return genericImg({ filename: 'generic_room.jpg', size: 'S' })
  }
})

const chars = computed(() => {
  return Object.values(props.saveData.book.playerCharacters)
    .map((charId) => props.saveData.book.characters[charId])
    .slice(0, 3)
})

const charImage = (char) => {
  if (char._image) {
    return bookImg({
      filename: char._image,
      size: 'S',
      bookId: props.saveData.book.id,
    })
  } else {
    let filename
    if (['male', 'female'].includes(char.gender)) {
      filename = `generic_${char.gender}.jpg`
    } else {
      filename = `generic_diverse.jpg`
    }
    return genericImg({ filename, size: 'S' })
  }
}
</script>

<style scoped>
.book {
  position: relative;
  width: 18rem;
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
