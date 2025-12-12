<template>
  <header>
    <TheSidebar />
  </header>
  <div class="main">
    <div class="page">
      <div class="third left">
        <slot name="leftSlot">[no content]</slot>
      </div>
      <div class="third middle">
        <slot name="middleSlot">[no content]</slot>
      </div>
      <div class="third right">
        <slot name="rightSlot">[no content]</slot>
      </div>
    </div>
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
  height: 100vh;
  max-width: var(--width-page);
  min-height: 100vh;
  margin-left: var(--width-navbar);
  background: var(--bg-page);
  display: grid;
  grid-template-columns: 1fr 3fr 1fr;
}

.third {
  padding: 1rem;
  height: 100vh;
  overflow: auto;
}

.middle {
  background: var(--bg-body);
}
</style>
