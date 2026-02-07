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
import { formatTime, formatDate } from '@/helpers/utils'

const book = useBookStore()
const { datetime } = storeToRefs(book)

const theDate = computed(() => {
  return formatDate(datetime.value)
})
const theTime = computed(() => {
  return formatTime(datetime.value)
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
