<template>
  <div class="sidebar">
    <div class="logobox">
      <div class="logo" :style="{ backgroundImage: `url(${logoImg})` }" @click="router.push('/')" />
    </div>
    <div class="main"></div>
    <RouterLink to="/">
      <div class="bar-option">
        <div class="bar-label">
          <font-awesome-icon class="icon" icon="fa-flag" /><span>Home</span>
        </div>
      </div>
    </RouterLink>
    <RouterLink to="/library">
      <div class="bar-option">
        <div class="bar-label">
          <font-awesome-icon class="icon" icon="fa-building-columns" /><span>Library</span>
        </div>
      </div>
    </RouterLink>
    <RouterLink to="/nightstand">
      <div class="bar-option">
        <div class="bar-label">
          <font-awesome-icon class="icon" icon="fa-book-bookmark" /><span>Nightstand</span>
        </div>
      </div>
    </RouterLink>
    <RouterLink to="/book">
      <div class="bar-option">
        <div class="bar-label">
          <font-awesome-icon class="icon" icon="fa-book-open-reader" /><span>Play</span>
        </div>
      </div>
    </RouterLink>
    <hr />
    <RouterLink to="/options">
      <div class="bar-option">
        <div class="bar-label">
          <font-awesome-icon class="icon" icon="fa-sliders" /><span>Options</span>
        </div>
      </div>
    </RouterLink>
    <RouterLink to="/help">
      <div class="bar-option">
        <div class="bar-label">
          <font-awesome-icon class="icon" icon="fa-circle-question" /><span>Help</span>
        </div>
      </div>
    </RouterLink>
    <RouterLink to="/about">
      <div class="bar-option">
        <div class="bar-label">
          <font-awesome-icon class="icon" icon="fa-signature" /><span>About</span>
        </div>
      </div>
    </RouterLink>
    <footer v-if="started" @click="showInfo">
      <img :src="coverM" class="cover" />
      <div class="book-title">
        <small>Currently playing:</small>
        <br />
        {{ title }}
      </div>
    </footer>
  </div>
</template>

<script setup>
import { markRaw } from 'vue'
import { storeToRefs } from 'pinia'
import { useBookStore } from '@/stores/book'
import BookPreview from '@/components/BookPreview.vue'
import logoImg from '@/assets/images/logo.jpg'

const bookStore = useBookStore()
const { title, coverM, started } = storeToRefs(bookStore)
import { useOptionsStore } from '@/stores/options'

const options = useOptionsStore()
import { useRouter } from 'vue-router'

const router = useRouter()

const showInfo = () => {
  options.lightbox = {
    component: markRaw(BookPreview),
    props: {
      book: bookStore,
      lightbox: true,
    },
  }
}
</script>

<style scoped>
.sidebar {
  width: var(--width-navbar);
  height: 100vh;
  background: var(--bg-dark);
  transition: all 0.25s ease-out 0.15s;
  box-shadow: 0px 0px 5px 0px #000;
}
hr {
  border-color: var(--bg-shade);
  margin: 1rem 0.25rem;
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
  padding: 0.75rem 0.5rem 2.25rem 0.5rem;
  margin: 0;
  cursor: pointer;
  overflow: hidden;
  color: var(--col-font-link);
}

.bar-option:hover {
  color: var(--col-font);
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
  transition: opacity 0.25s ease-out 0.15s;
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
  border-radius: 0 0.25rem 0 0;
  box-shadow: var(--drop-shadow);
  z-index: 1000;
  transition: all 0.25s ease-out 0.15s;
}
footer .book-title {
  position: relative;
  width: var(--width-navbar-extended);
  margin: 0 0 10rem 2rem;
  z-index: 2001;
  color: var(--col-font-toned);
  text-shadow: var(--text-shadow);
  opacity: 0;
  transition: opacity 0.1s ease-out 0.15s;
}

/* Active Link */

.router-link-active .bar-option {
  color: var(--col-font);
}
.router-link-active .icon {
  transform: scale(1.3);
}
.router-link-active .bar-label > span {
  margin-left: 0.75rem;
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
  transition: opacity 0.4s ease-in-out 0.5s;
}
.sidebar:hover footer img.cover {
  width: 8rem;
  height: auto;
  bottom: -2rem;
  left: calc(50% - 4rem);
  border-radius: 0.5rem 0.5rem 0 0;
  box-shadow: var(--drop-shadow);
  transform: rotate(-4deg);
  transition: all 0.4s ease-in-out 0.5s;
}
.sidebar:hover footer .book-title {
  opacity: 1;
  transition: opacity 0.1s ease-in-out 0.8s;
}
</style>
