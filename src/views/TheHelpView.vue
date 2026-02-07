<template>
  <TheSingleLayout>
    <div class="content vertical-center-flex">
      <div class="page-header">
        <h1>Help</h1>
      </div>
      <HelpBox :data="getHelpData('commands')"></HelpBox>
      <HelpBox :data="getHelpData('natural')"></HelpBox>
      <HelpBox :data="getHelpData('short')"></HelpBox>
    </div>
  </TheSingleLayout>
</template>

<script setup>
import TheSingleLayout from '@/layouts/TheSingleLayout.vue'
import { getHelpData } from '@/helpers/utils'
import HelpBox from '@/components/HelpBox.vue'
</script>

<style scoped>
.content {
  width: 100%;
}
</style>
