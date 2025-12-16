<template>
  <img src="@/assets/images/logo.jpg" class="logo" @click="router.push('/')" />
  <div class="main"></div>
  <div class="bar-option" @click="router.push('/')">Shelf</div>
  <!-- book shelf -->
  <div class="bar-option" @click="router.push('/options')">Options</div>
  <!-- hide other locations ins dialog / hide type hints -->
  <div class="bar-option" @click="router.push('/help')">Help</div>
  <!-- type hints -->
  <div class="bar-option" @click="router.push('/book')">Play</div>
  <!-- back to book -->
  <div class="bar-option" @click="router.push('/about')">About</div>
  <!-- about Morpheus -->
  <footer v-if="started" @click="router.push('/info')">
    <img :src="'images/' + cover" class="cover" />
    <div>
      <small>Currently playing:</small>
      <br />
      {{ title }}
    </div>
  </footer>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useBookStore } from '@/stores/book'
const bookStore = useBookStore()
const { title, cover, started } = storeToRefs(bookStore)
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<style scoped>
.logo {
  width: 100%;
  height: auto;
  cursor: pointer;
}
.main {
  padding: 0.5rem;
}
.bar-option {
  padding: 0.5rem;
  margin: 0 0 0.5rem;
  background: var(--bg-boxlight);
  cursor: pointer;
}
.bar-option:hover {
  background: var(--bg-highlight);
}

footer {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  padding: 0.5rem;
  cursor: pointer;
}
footer img.cover {
  position: absolute;
  width: 8rem;
  height: auto;
  bottom: -2rem;
  left: calc(50% - 4rem);
  box-shadow: var(--drop-shadow);
  transform: rotate(-4deg);
  z-index: 1000;
}
footer div {
  position: relative;
  text-align: center;
  z-index: 2001;
  text-shadow: var(--text-shadow);
}
</style>
