<template>
  <TheMainLayout>
    <template #default>
      <div class="page-header">
        <h1>Game Options</h1>
        <div class="box options-box">
          <div>Show id hints fro characters and places:</div>
          <input type="radio" id="idHintsMode_never" value="never" v-model="options.idHintsMode" />
          <label for="idHintsMode_never">Never</label><br />
          <input type="radio" id="idHintsMode_auto" value="auto" v-model="options.idHintsMode" />
          <label for="idHintsMode_auto">Auto</label><br />
          <input
            type="radio"
            id="idHintsMode_always"
            value="always"
            v-model="options.idHintsMode"
          />
          <label for="idHintsMode_always">Always</label>
        </div>
      </div>
    </template>
  </TheMainLayout>
</template>

<script setup>
import TheMainLayout from '@/layouts/TheMainLayout.vue'

import { useOptionsStore } from '@/stores/options'
const options = useOptionsStore()
</script>

<style scoped>
.options-box {
  padding: 0.5rem;
  width: 30%;
}
</style>
