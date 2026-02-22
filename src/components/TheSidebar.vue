<template>
  <div class="sidebar">
    <div class="logobox">
      <div class="logo" :style="{ backgroundImage: `url(${logoImg})` }" @click="router.push('/')" />
    </div>
    <div class="main"></div>
    <div class="bar-option" @click="router.push('/book')">
      <div class="bar-label">
        <font-awesome-icon class="icon" icon="fa-book-open" /><span>Play</span>
      </div>
    </div>
    <div class="bar-option" @click="router.push('/')">
      <div class="bar-label">
        <font-awesome-icon class="icon" icon="fa-book-atlas" /><span>Shelf</span>
      </div>
    </div>
    <div class="bar-option" @click="router.push('/options')">
      <div class="bar-label">
        <font-awesome-icon class="icon" icon="fa-sliders" /><span>Options</span>
      </div>
    </div>
    <div class="bar-option" @click="router.push('/help')">
      <div class="bar-label">
        <font-awesome-icon class="icon" icon="fa-circle-question" /><span>Help</span>
      </div>
    </div>
    <div class="bar-option" @click="router.push('/about')">
      <div class="bar-label">
        <font-awesome-icon class="icon" icon="fa-address-card" /><span>About</span>
      </div>
    </div>
    <footer v-if="started" @click="router.push('/info')">
      <img :src="'images/M/' + cover" class="cover" />
      <div class="book-title">
        <small>Currently playing:</small>
        <br />
        {{ title }}
      </div>
    </footer>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useBookStore } from '@/stores/book'
const bookStore = useBookStore()
const { title, cover, started } = storeToRefs(bookStore)
import { useRouter } from 'vue-router'
const router = useRouter()
import logoImg from '@/assets/images/logo.jpg'
</script>

<style scoped>
.sidebar {
  width: var(--width-navbar);
  height: 100vh;
  background: #030310;
  transition: all 0.25s ease-out 0.15s;
  box-shadow: 0px 0px 5px 0px #000;
}
.logobox {
  height: var(--width-navbar-extended);
}
.logo {
  width: 100%;
  aspect-ratio: 1/1;
  background-size: 160% 160%;
  background-position: 50% 15%;
  cursor: pointer;
  transition: all 0.25s ease-out 0.15s;
}
.main {
  padding: 0.5rem;
}
.bar-option {
  height: 2.5rem;
  width: 100%;
  padding: 0.5rem;
  margin: 0 0 0.5rem;
  background: #121226;
  cursor: pointer;
  overflow: hidden;
}

.bar-option:hover {
  background: var(--bg-highlight);
}

.bar-label {
  width: 20rem;
  display: flex;
  align-items: center;
}

.icon {
  font-size: 1.5rem;
}

.bar-label > span {
  opacity: 0;
  margin-left: 0.5rem;
  transition: all 0.25s ease-out 0.15s;
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
  width: 4rem;
  height: auto;
  bottom: 0;
  left: 0;
  box-shadow: var(--drop-shadow);
  z-index: 1000;
  transition: all 0.25s ease-out 0.15s;
}
footer .book-title {
  position: relative;
  text-align: center;
  z-index: 2001;
  text-shadow: var(--text-shadow);
  opacity: 0;
  transition: opacity 0.25s ease-out 0.15s;
}

/* Hovering */

.sidebar:hover {
  width: var(--width-navbar-extended);
  transition: all 0.4s ease-in-out 0.5s;
}
.sidebar:hover .logo {
  background-size: 100% 100%;
  background-position: 50% 50%;
  transition: all 0.4s ease-in-out 0.5s;
}
.sidebar:hover .bar-label > span {
  opacity: 1;
  transition: all 0.4s ease-in-out 0.5s;
}
.sidebar:hover footer img.cover {
  width: 8rem;
  height: auto;
  bottom: -2rem;
  left: calc(50% - 4rem);
  box-shadow: var(--drop-shadow);
  transform: rotate(-4deg);
  transition: all 0.4s ease-in-out 0.5s;
}
.sidebar:hover footer .book-title {
  opacity: 1;
  transition: opacity 0.4s ease-in-out 0.5s;
}
</style>
