<template>
  <div class="box help-box">
    <h2 @click="toggle">{{ data.title }}</h2>
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
.help-box {
  padding: 0.5rem;
  width: 90%;
  max-width: 65rem;
}

h2 {
  cursor: pointer;
}
</style>
