<template>
  <div class="content">
    <div class="box time-box">
      <div class="date">
        {{ theDate }}
      </div>
      <div class="time">
        {{ theTime }}
      </div>
    </div>
    <div class="buttons">
      <ActionButton @click="addTime(60)" icon="hourglass-half" text="1 min" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useBookStore } from '@/stores/book'
import { formatTime, formatDate } from '@/helpers/utils'
import ActionButton from '@/components/ActionButton.vue'

const book = useBookStore()
const { datetime } = storeToRefs(book)

const theDate = computed(() => {
  return formatDate(datetime.value)
})
const theTime = computed(() => {
  return formatTime({ datetime: datetime.value })
})

const addTime = (seconds) => {
  book.addTime(seconds)
}
</script>

<style scoped>
.content {
  width: 100%;
  display: grid;
  column-gap: 0.5em;
  grid-template-columns: 1fr auto;
}
.time-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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
.buttons {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
.buttons > * {
  width: 100%;
}
</style>
