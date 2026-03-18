<template>
  <div class="page">
    <div class="page-header">
      <h1>
        <slot name="titleSlot"></slot>
      </h1>
    </div>
    <slot name="contentSlot"></slot>
  </div>
</template>

<script setup></script>

<style scoped>
.page {
  display: grid;
  grid-template-rows: auto auto;
  padding: 1rem;
}
</style>
