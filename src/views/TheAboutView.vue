<template>
  <TheSingleLayout>
    <div class="content vertical-center-flex">
      <div class="page-header">
        <h1>About Morpheus</h1>
      </div>
      Version: {{ version }}
    </div>
  </TheSingleLayout>
</template>

<script setup>
import { computed } from 'vue'
import TheSingleLayout from '@/layouts/TheSingleLayout.vue'

const version = computed(() => __APP_VERSION__)
</script>

<style scoped>
.content {
  width: 100%;
}
</style>
