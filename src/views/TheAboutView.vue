<template>
  <TheSingleLayout>
    <div class="content vertical-center-flex">
      <div class="page-header">
        <h1>About Morpheus</h1>
      </div>
      <div class="version">Version: {{ version }}</div>
      <div v-html="impressum" class="box about-box"></div>
      <div v-html="aiAgenda" class="box about-box"></div>
    </div>
  </TheSingleLayout>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import TheSingleLayout from '@/layouts/TheSingleLayout.vue'

const version = computed(() => __APP_VERSION__)
const impressum = ref('')
const aiAgenda = ref('')

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
    const res = await fetch('content/ai_agenda.local.html')
    if (!res.ok) throw new Error()
    aiAgenda.value = await res.text()
  } catch {}
})
</script>

<style scoped>
.content {
  width: 60%;
  min-width: 28rem;
}
.about-box {
  padding: 0.5rem;
}
</style>
