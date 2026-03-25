<template>
  <div class="page">
    <div class="header">
      <div class="page-header">
        <h1>
          <slot name="titleSlot"></slot>
        </h1>
      </div>
    </div>
    <div class="half left">
      <slot name="leftSlot">[no content]</slot>
    </div>
    <div class="half right">
      <slot name="rightSlot">[no content]</slot>
    </div>
  </div>
</template>

<script setup></script>

<style scoped>
.page {
  max-width: 72rem;
  margin: 0 auto;
  padding: 1rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
  grid-template-areas:
    'header header'
    'left right';
  column-gap: 1rem;
}

.header {
  grid-area: header;
}

.left {
  grid-area: left;
}

.right {
  grid-area: right;
}
</style>
