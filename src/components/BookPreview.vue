<template>
  <div class="book-preview" :class="baseClass">
    <img :src="cover" class="cover" />
    <div v-if="savegame" class="bookmark">BOOKMARK</div>
    <div>
      <h2>
        {{ book.title }} <small>{{ book.version.book }}</small>
      </h2>
      <p class="sub-heading">by {{ book.author }}</p>
      <p v-if="supported === 'min'">
        <span class="tag tag-warning">
          created for Morpheus {{ book.version.book }}, some features may be unsupported
        </span>
      </p>
      <p v-if="supported === 'unsupported'">
        <span class="tag tag-warning">
          created for Morpheus {{ book.version.book }}, no longer supported
        </span>
      </p>
      <p>
        <span v-for="tag in book.tags" :key="tag" class="tag">
          {{ tag }}
        </span>
      </p>
      <p class="description">{{ description }}</p>
      <div v-if="savegame" class="state">
        <div class="room" :style="{ backgroundImage: `url(${roomImage})` }">
          {{ roomData.name }}
        </div>
        <div
          class="character"
          v-for="char in chars"
          :key="char.id"
          :style="{ backgroundImage: `url(${charImage(char)})` }"
        >
          {{ char.name }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { genericImg, bookImg, checkSupported } from '@/helpers/utils'
const props = defineProps({
  book: {
    type: Object,
    required: true,
  },
  savegame: {
    type: Boolean,
    default: false,
  },
  lightbox: {
    type: Boolean,
    default: false,
  },
})

const baseClass = computed(() => {
  if (props.lightbox) {
    return ['lightbox']
  } else {
    return []
  }
})

const cover = computed(() => {
  console.log(props.book)
  if (props.book.coverL) {
    return props.book.coverL
  } else if (props.book.cover) {
    return bookImg({ filename: props.book.cover, size: 'L', bookId: props.book.id })
  } else if (props.book._cover) {
    return bookImg({ filename: props.book._cover, size: 'L', bookId: props.book.id })
  } else {
    return genericImg({ filename: 'generic_cover.jpg', size: 'L' })
  }
})

const supported = computed(() => {
  return checkSupported(props.book.version.book)
})

const description = computed(() => {
  if (props.savegame) {
    return props.book.saveSummary
  } else {
    return props.book.description
  }
})

// Savegame Data

const roomData = computed(() => {
  if (!props.savegame) return
  const roomPath = props.book.roomId.split('/')
  return props.book.destinations[roomPath[0]].locations[roomPath[0] + '/' + roomPath[1]].rooms[
    props.book.roomId
  ]
})

const roomImage = computed(() => {
  if (!props.savegame) return
  if (roomData.value._image) {
    return bookImg({
      filename: roomData.value._image,
      size: 'L',
      bookId: props.book.id,
    })
  } else {
    return genericImg({ filename: 'generic_room.jpg', size: 'S' })
  }
})

const chars = computed(() => {
  if (!props.savegame) return
  return Object.values(props.book.playerCharacters)
    .map((charId) => props.book.characters[charId])
    .slice(0, 3)
})

const charImage = (char) => {
  if (!props.savegame) return
  if (char._image) {
    return bookImg({
      filename: char._image,
      size: 'S',
      bookId: props.book.id,
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
.book-preview {
  position: relative;
  width: 100%;
  max-width: 72rem;
  text-align: left;
  display: grid;
  grid-template-columns: 3fr 7fr;
  column-gap: 1rem;
}
.cover {
  width: 100%;
  border-radius: 0.5rem;
}
.description {
  margin-top: 1.5rem;
  white-space: pre-line;
}
.bookmark {
  width: 2.5rem;
  height: 8rem;
  position: absolute;
  top: -0.25rem;
  left: 1rem;
  padding: 0.5rem 0 0 0.8rem;
  background: var(--bg-highlight);
  clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 85%, 0 100%);
  writing-mode: vertical-lr;
  text-orientation: sideways;
}
.state {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.room {
  height: 5rem;
  aspect-ratio: 16 / 9;
  border-radius: 0.5rem;
  background-position: center center;
  background-size: cover;
  display: flex;
  justify-content: center;
  align-items: flex-end;
}
.character {
  height: 5rem;
  aspect-ratio: 5 / 7;
  border-radius: 0.5rem;
  background-position: center center;
  background-size: cover;
  display: flex;
  justify-content: center;
  align-items: flex-end;
}
.lightbox h2 {
  margin-top: 1rem;
}
</style>
