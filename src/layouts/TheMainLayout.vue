<template>
  <header>
    <TheSidebar />
  </header>
  <div class="main">
    <slot></slot>
  </div>
</template>

<script setup>
import TheSidebar from '@/components/TheSidebar.vue'
</script>

<style scoped>
header {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
}
.main {
  width: calc(100% - var(--width-navbar));
  max-width: var(--width-page);
  min-height: 100vh;
  margin-left: var(--width-navbar);
  background: var(--bg-page);
  z-index: 1;
}
</style>
