<template>
  <div class="box header-box">
    <header @click="toggle">
      <h2>{{ data.title }}</h2>
    </header>
    <p v-html="helpText" v-if="!isCollapsed"></p>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import MarkdownIt from 'markdown-it'
const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
})

const md = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: false,
  typographer: false,
})

const isCollapsed = ref(true)
const toggle = () => {
  isCollapsed.value = !isCollapsed.value
}

const helpText = computed(() => {
  return md.render(props.data.text)
})
</script>

<style>
h2 {
  cursor: pointer;
}
</style>
