<template>
  <span>
    <font-awesome-icon v-if="icon" :icon="`fa-${icon}`" />
  </span>
</template>

<script setup>
const props = defineProps({
  icon: {
    type: String,
    default: null,
  },
})
</script>

<style scoped>
span {
  color: var(--col-font-link);
  cursor: pointer;
}
span:hover {
  color: var(--col-font);
}
</style>
