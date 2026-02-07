<template>
  <div class="wrapper">
    <img :src="props.src" />
    <font-awesome-icon class="max" icon="fa-maximize" @click.stop="lightbox" />
  </div>
</template>

<script setup>
import { useOptionsStore } from '@/stores/options'
const options = useOptionsStore()

const props = defineProps({
  src: {
    type: String,
    required: true,
  },
})

const lightbox = () => {
  const fullSrc = props.src.replace(/\/[SML]\//, '/full/') // use full image
  options.lightboxImage = fullSrc
}
</script>

<style scoped>
.wrapper {
  position: relative;
  border-radius: 0.5rem;
}
img {
  width: 100%;
  height: auto;
  border-radius: 0;
  margin: 0;
}
.max {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  opacity: 0.33;
}
.max:hover {
  opacity: 1;
}
</style>
