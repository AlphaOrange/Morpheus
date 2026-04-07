<template>
  <TheTwoColumnsLayout>
    <template #titleSlot>About Morpheus</template>
    <template #subtitleSlot>
      Morpheus Interactive Story Engine<br />
      Version: {{ version }}
    </template>
    <template #leftSlot>
      <div class="vertical-center-flex">
        <div v-html="impressum" class="box"></div>
        <div v-html="privacyPolicy" class="box"></div>
        <div v-html="aiAgenda" class="box"></div>
      </div>
    </template>
    <template #rightSlot>
      <div class="vertical-center-flex">
        <div class="box">
          <h2>Change Log</h2>
          <div class="changelog" v-html="renderMarkdown(changelog)"></div>
        </div>
      </div>
    </template>
  </TheTwoColumnsLayout>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import TheTwoColumnsLayout from '@/layouts/TheTwoColumnsLayout.vue'
import { changelog } from '@/helpers/utils'
import MarkdownIt from 'markdown-it'
const md = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: false,
  typographer: false,
})

const version = computed(() => __APP_VERSION__)
const impressum = ref('')
const privacyPolicy = ref('')
const aiAgenda = ref('')

const renderMarkdown = (text) => {
  return md.render(text || '')
}

onMounted(async () => {
  try {
    const res = await fetch('content/impressum.local.html')
    if (!res.ok) throw new Error()
    impressum.value = await res.text()
  } catch {
    const res = await fetch('content/impressum.placeholder.html')
    impressum.value = await res.text()
  }
  try {
    const res = await fetch('content/privacy_policy.local.html')
    if (!res.ok) throw new Error()
    privacyPolicy.value = await res.text()
  } catch {
    const res = await fetch('content/privacy_policy.placeholder.html')
    privacyPolicy.value = await res.text()
  }
  try {
    const res = await fetch('content/ai_agenda.local.html')
    if (!res.ok) throw new Error()
    aiAgenda.value = await res.text()
  } catch {}
})
</script>

<style scoped>
.changelog :deep(strong) {
  font-weight: normal;
  text-decoration: underline;
}
</style>
