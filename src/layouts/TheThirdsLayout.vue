<template>
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
</template>

<script setup></script>

<style scoped>
.page {
  display: grid;
  grid-template-columns: minmax(16rem, 1fr) 3fr minmax(16rem, 1fr);
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
