<template>
  <TheTwoColumnsLayout>
    <template #titleSlot>About Morpheus</template>
    <template #leftSlot>
      <div v-html="impressum" class="box"></div>
    </template>
    <template #rightSlot>
      <div class="vertical-center-flex">
        <div class="box">
          Morpheus Interactive Story Engine<br />
          Version: {{ version }}
        </div>
        <div v-html="aiAgenda" class="box"></div>
      </div>
    </template>
  </TheTwoColumnsLayout>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import TheTwoColumnsLayout from '@/layouts/TheTwoColumnsLayout.vue'

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

<style scoped></style>
