<template>
  <TheSingleLayout>
    <template #titleSlot>Morpheus</template>
    <template #contentSlot>
      <p>About Text</p>
    </template>
  </TheSingleLayout>
</template>

<script setup>
import TheSingleLayout from '@/layouts/TheSingleLayout.vue'
</script>

<style scoped>
.content {
  text-align: center;
}
</style>
