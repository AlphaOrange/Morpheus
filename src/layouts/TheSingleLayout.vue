<template>
  <div class="page">
    <slot></slot>
  </div>
</template>

<script setup></script>

<style scoped>
.page {
  width: 100%;
  max-width: var(--width-page);
  min-height: 100vh;
  background: var(--bg-page);
  display: flex;
  justify-content: center;
  padding: 1rem;
}
</style>
