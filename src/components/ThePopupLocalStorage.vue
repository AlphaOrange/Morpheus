<template>
  <div class="box warning-box">
    <h2>Save Book</h2>
    <p>
      I consent to storing all game content including dialog and - if I explicitly permitted via
      options - my API key in my browser's local storage.
    </p>
    <div class="button-list">
      <button @click="deny">No, don't save</button>
      <button @click="allow">Yes, continue save</button>
    </div>
  </div>
</template>

<script setup>
import { useOptionsStore } from '@/stores/options'
import { useShelfStore } from '@/stores/shelf'

const options = useOptionsStore()
const shelf = useShelfStore()

const deny = () => {
  options.legalAllowLocalStorage = false
  options.lightbox.component = null
  options.lightbox.props = {}
}

const allow = () => {
  options.legalAllowLocalStorage = true
  options.lightbox.component = null
  options.lightbox.props = {}
  shelf.saveBook()
}
</script>

<style scoped></style>
