<template>
  <TheTwoColumnsLayout>
    <template #titleSlot>Game Options</template>
    <template #leftSlot>
      <div class="vertical-center-flex">
        <div class="box header-box">
          <header>
            <h2>LLM Configuration</h2>
          </header>
          <h3>AI Configuration</h3>
          <div class="input-group">
            <label for="selectAiVendor">Model Name:</label>
            <select v-model="options.aiVendor" id="selectAiVendor" class="long">
              <option>Google</option>
            </select>
            <input type="checkbox" id="idLegalAllowAI" v-model="options.legalAllowAI" />
            <label for="idLegalAllowAI"
              >I consent to the transfer of data to the selected AI service provider</label
            ><br /><br />
            <label for="selectAiVersion">Model Version:</label>
            <select v-model="options.aiModel" id="selectAiVersion" class="long">
              <option>gemini-2.5-flash</option>
              <option>gemini-2.5-flash-lite</option>
            </select>
            <input type="checkbox" id="idShowUsage" v-model="options.showTokenUsage" />
            <label for="idShowUsage">Permanently display number of tokens used in session</label>
          </div>
          <h3>API Key:</h3>
          <div class="input-group">
            <input
              type="text"
              v-model="options.aiApiKey"
              placeholder="insert valid key"
              class="long"
            />
            <input type="checkbox" id="idAiApiKeyAllowSave" v-model="options.aiApiKeyAllowSave" />
            <label for="idAiApiKeyAllowSave">Store key with savegame</label>
          </div>
          <h3>Safety Settings:</h3>
          <div class="input-group">
            <label for="selectAiSafetyHarassment">Harassment:</label>
            <select v-model="options.aiSafetyHarassment" id="selectAiSafetyHarassment">
              <option value="BLOCK_NONE">None</option>
              <option value="BLOCK_ONLY_HIGH">Low</option>
              <option value="BLOCK_MEDIUM_AND_ABOVE">Medium</option>
              <option value="BLOCK_LOW_AND_ABOVE">High</option>
            </select>
            <label for="selectAiSafetyHateSpeech">Hate Speech:</label>
            <select v-model="options.aiSafetyHateSpeech" id="selectAiSafetyHateSpeech">
              <option value="BLOCK_NONE">None</option>
              <option value="BLOCK_ONLY_HIGH">Low</option>
              <option value="BLOCK_MEDIUM_AND_ABOVE">Medium</option>
              <option value="BLOCK_LOW_AND_ABOVE">High</option>
            </select>
            <label for="selectAiSafetySexual">Sexually Explicit: </label>
            <select v-model="options.aiSafetySex" id="selectAiSafetySexual">
              <option value="BLOCK_NONE">None</option>
              <option value="BLOCK_ONLY_HIGH">Low</option>
              <option value="BLOCK_MEDIUM_AND_ABOVE">Medium</option>
              <option value="BLOCK_LOW_AND_ABOVE">High</option>
            </select>
            <label for="selectAiSafetyDangerous">Dangerous Content: </label>
            <select v-model="options.aiSafetyDangerous" id="selectAiSafetyDangerous">
              <option value="BLOCK_NONE">None</option>
              <option value="BLOCK_ONLY_HIGH">Low</option>
              <option value="BLOCK_MEDIUM_AND_ABOVE">Medium</option>
              <option value="BLOCK_LOW_AND_ABOVE">High</option>
            </select>
            <p>
              Safety Settings work <i>in addition</i> to the inherent safety of the model in use.
            </p>
          </div>
        </div>
      </div>
    </template>
    <template #rightSlot>
      <div class="vertical-center-flex">
        <div class="box header-box">
          <header>
            <h2>NPC Behaviour</h2>
          </header>
          <div>Run NPCs automatically</div>
          <div class="input-group">
            <input
              type="radio"
              id="idlingBeforeTriggerNpc_2"
              value="2"
              v-model.number="options.idlingBeforeTriggerNpc"
            />
            <label for="idlingBeforeTriggerNpc_2">2 seconds after player message</label><br />
            <input
              type="radio"
              id="idlingBeforeTriggerNpc_4"
              value="4"
              v-model.number="options.idlingBeforeTriggerNpc"
            />
            <label for="idlingBeforeTriggerNpc_4">4 seconds after player message</label><br />
            <input
              type="radio"
              id="idlingBeforeTriggerNpc_6"
              value="6"
              v-model.number="options.idlingBeforeTriggerNpc"
            />
            <label for="idlingBeforeTriggerNpc_6">6 seconds after player message</label><br />
            <input
              type="radio"
              id="idlingBeforeTriggerNpc_10"
              value="10"
              v-model.number="options.idlingBeforeTriggerNpc"
            />
            <label for="idlingBeforeTriggerNpc_10">10 seconds after player message</label><br />
            <input
              type="radio"
              id="idlingBeforeTriggerNpc_no"
              value="9999"
              v-model.number="options.idlingBeforeTriggerNpc"
            />
            <label for="idlingBeforeTriggerNpc_no">Never run automatically</label><br />
          </div>
        </div>
        <div class="box header-box">
          <header>
            <h2>Optional Features</h2>
          </header>
          <div>Some of these features might have additional AI usage:</div>
          <div class="input-group">
            <input
              type="checkbox"
              id="idUseAiForSavegameSummary"
              v-model="options.useAiForSavegameSummary"
            />
            <label for="idUseAiForSavegameSummary">Use AI for savegame summaries</label>
          </div>
        </div>
        <div class="box header-box">
          <header>
            <h2>Hints</h2>
          </header>
          <div>Show id hints from characters and places:</div>
          <div class="input-group">
            <input
              type="radio"
              id="idHintsMode_never"
              value="never"
              v-model="options.idHintsMode"
            />
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
          <div>Reduce button size if too many options available:</div>
          <div class="input-group">
            <input type="checkbox" id="idUseCompactButtons" v-model="options.useCompactButtons" />
            <label for="idUseCompactButtons">Yes</label>
          </div>
        </div>
      </div>
    </template>
  </TheTwoColumnsLayout>
</template>

<script setup>
import TheTwoColumnsLayout from '@/layouts/TheTwoColumnsLayout.vue'

import { useOptionsStore } from '@/stores/options'
const options = useOptionsStore()
</script>

<style scoped></style>
