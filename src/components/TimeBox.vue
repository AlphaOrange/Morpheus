<template>
  <div class="box time-box">
    <div class="date">
      {{ theDate }}
    </div>
    <div class="time">
      {{ theTime }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useBookStore } from '@/stores/book'
const book = useBookStore()
const { datetime } = storeToRefs(book)

const theDate = computed(() => {
  const d = datetime.value.getDate()
  const m = datetime.value.getMonth() + 1
  const y = datetime.value.getFullYear()
  return `${d}. ${m}. ${y}`
})

// TODO: this does not update on datetime change
const theTime = computed(() => {
  const h = String(datetime.value.getHours()).padStart(2, '0')
  const min = String(datetime.value.getMinutes()).padStart(2, '0')
  return `${h}:${min}`
})
</script>

<style scoped>
.time-box {
  padding: 0.5rem;
}
.date,
.time {
  width: 100%;
  text-align: center;
}
.date {
  font-size: 1rem;
}
.time {
  font-size: 2rem;
  font-weight: 700;
}
</style>
