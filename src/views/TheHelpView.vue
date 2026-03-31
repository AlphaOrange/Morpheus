<template>
  <TheTwoColumnsLayout>
    <template #titleSlot>Help</template>
    <template #leftSlot>
      <div class="vertical-center-flex">
        <HelpBox :data="getHelpData('commands')"></HelpBox>
        <HelpBox :data="getHelpData('natural')"></HelpBox>
        <HelpBox :data="getHelpData('short')"></HelpBox>
      </div>
    </template>
    <template #rightSlot>
      <div class="vertical-center-flex">
        <HelpBox :data="getHelpData('example')"></HelpBox>
        <HelpBox :data="getHelpData('meta')"></HelpBox>
      </div>
    </template>
  </TheTwoColumnsLayout>
</template>

<script setup>
import TheTwoColumnsLayout from '@/layouts/TheTwoColumnsLayout.vue'
import { getHelpData } from '@/helpers/utils'
import HelpBox from '@/components/HelpBox.vue'
</script>

<style scoped></style>
