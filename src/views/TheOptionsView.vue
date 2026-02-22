<template>
  <TheSingleLayout>
    <div class="content vertical-center-flex">
      <div class="page-header">
        <h1>Game Options</h1>
      </div>
      <div class="box options-box">
        <h3>LLM Configuration</h3>
        <div>Use model:</div>
        <div class="input-group">
          <select v-model="options.aiVendor">
            <option>Gemini</option>
          </select>
          <br />
          <select v-model="options.aiModel">
            <option>gemini25_flash_lite</option>
            <option>gemini25_flash</option>
            <option>gemini20_flash</option>
          </select>
        </div>
        <div>API Key:</div>
        <div class="input-group">
          <input v-model="options.aiApiKey" placeholder="insert valid key" class="long" />
        </div>
      </div>
      <div class="box options-box">
        <h3>Hints</h3>
        <div>Show id hints from characters and places:</div>
        <div class="input-group">
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
    </div>
  </TheSingleLayout>
</template>

<script setup>
import TheSingleLayout from '@/layouts/TheSingleLayout.vue'

import { useOptionsStore } from '@/stores/options'
const options = useOptionsStore()
</script>

<style scoped>
.content {
  width: 100%;
}
.options-box {
  min-width: 30%;
  padding: 0.5rem;
  width: 30%;
}
.input-group {
  margin: 0.5rem;
}
input[type='radio'] {
  margin: 0 0.5rem 0.25rem 0;
}
.long {
  width: 100%;
}
</style>
