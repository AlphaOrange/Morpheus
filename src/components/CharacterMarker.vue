<template>
  <div class="character-marker">
    <div class="character-image" :style="{ backgroundImage: `url(images/${character.image})` }">
      <font-awesome-icon v-if="icon" :icon="`fa-${icon}`" class="character-icon" />
      <div class="pill character-pill">{{ props.text }}</div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  character: {
    type: Object,
    required: true,
  },
  icon: {
    type: String,
    default: null,
  },
  text: {
    type: String,
    default: '',
  },
})
</script>

<style scoped>
.character-marker {
  padding-left: 0.5rem;
  width: 4.5rem;
}

.character-image {
  display: flex;
  align-content: center;
  align-items: center;
  justify-content: center;
  position: relative;
  height: 2rem;
  width: 2rem;
  border-radius: 0.5rem;
  background-position: center center;
  background-size: cover;
}

.character-icon {
  position: absolute;
  left: -0.75rem;
  color: #fff;
  filter: drop-shadow(0px 0px 2px #000);
}

.character-pill {
  position: absolute;
  left: 1.5rem;
}
</style>
