<template>
  <div class="box narrow character-box">
    <div class="image-box">
      <LightboxImage :src="previewImage" class="image" />
    </div>
    <div class="info-box">
      <div class="profession">{{ props.character.profession }}</div>
      <div class="socio">{{ props.character.gender }} / {{ props.character.age }} years old</div>
      <div class="description">{{ shortDescription }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { truncateString, genericImg } from '@/helpers/utils'
import LightboxImage from '@/components/LightboxImage.vue'

const props = defineProps({
  character: {
    type: Object,
    required: true,
  },
  bookId: {
    type: String,
    required: true,
  },
})

const shortDescription = computed(() => {
  return truncateString(props.character.selectionDescription, 300)
})

const previewImage = computed(() => {
  if (props.character._image) {
    return `/books/${props.bookId}/M/${props.character._image}`
  } else {
    return genericImg({ filename: 'generic_character.jpg', size: 'L' })
  }
})
</script>

<style scoped>
.character-box {
  display: grid;
  grid-template-columns: 8rem 1fr;
  grid-template-rows: 1fr;
  cursor: pointer;
}
.info-box {
  padding: 1rem;
}
.image {
  display: block;
  float: left;
  width: 100%;
  height: auto;
  margin: 0 1rem 0 0;
}
.profession {
  margin: -0.75rem 0 0;
}
.socio {
  font-size: 0.75rem;
  margin: 0 0 0.5rem;
}
.image-box {
  position: relative;
}
</style>
