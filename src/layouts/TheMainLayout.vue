<script setup>
import TheSidebar from '@/components/TheSidebar.vue'
</script>

<template>
  <header>
    <TheSidebar />
  </header>
  <div class="main">
    <div class="page">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
header {
  position: fixed;
  top: 0;
  left: 0;
  width: var(--width-navbar);
  height: 100vh;
  background: var(--bg-navbar);
}
.main {
  display: flex;
  justify-content: center;
}
.page {
  width: calc(100% - var(--width-navbar));
  max-width: var(--width-page);
  min-height: 100vh;
  margin-left: var(--width-navbar);
  padding: 1rem;
  background: var(--bg-page);
}
</style>
