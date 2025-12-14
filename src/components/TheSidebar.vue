<template>
  <img src="@/assets/images/logo.jpg" class="logo" @click="toHome" />
  <div class="main"></div>
  <h3>Book Info (e.g. World)</h3>
  <h3>Options</h3>
  hide other locations ins dialog<br />
  hide type hints
  <footer v-if="loaded">
    <img :src="'images/' + cover" class="cover" />
    <div>
      <small>Du spielst gerade:</small>
      <br />
      {{ title }}
    </div>
  </footer>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useBookStore } from '@/stores/book'
const bookStore = useBookStore()
const { title, cover, loaded } = storeToRefs(bookStore)
import { useRouter } from 'vue-router'
const router = useRouter()

const toHome = function () {
  router.push('/')
}
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
footer {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  padding: 0.5rem;
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
