import { defineStore } from 'pinia'
import { safetySettings } from '@/data/llm'

// these options will be stored and restored with saving/loading books
const SAVEABLE_OPTIONS = [
  // User Settings
  'idHintsMode',
  'idlingBeforeTriggerNpc',
  // AI Settings
  'aiVendor',
  'aiModel',
  'aiApiKey',
  'aiSafetyHarassment',
  'aiSafetyHateSpeech',
  'aiSafetySex',
  'aiSafetyDangerous',
  // Book Settings
  'talkDuration',
  'moveDurationRoom',
  'moveDurationLocation',
  'moveDurationDestination',
]

export const useOptionsStore = defineStore('options', {
  state: () => ({
    // Engine Parameters (cannot be changed, e.g. ui settings)
    // Display parameters
    lookbackInfo: 20, // how many messages until an Info message disappears?
    lookbackSystem: 20, // how many messages until a System message disappears?
    lookbackError: 5, // how many messages until an Error message disappears?
    // Pressure parameters
    pressure_notSpokenYet: 100,
    pressure_notAnsweredYet: 80,
    pressure_spokenToUnresolved: -50,
    pressure_runningDialog: 60,
    pressure_notSpokenRounds: 15,
    pressure_threshold: 40, // if max pressure above: ai must act
    pressure_noActionProb: 0.5, // max probability of no-action if below threshold
    maxRunningDialogLength: 8, // running dialog length for max pressure
    maxNotSpokenRounds: 12, // not spoken rounds for max pressure
    multiActionThreshold: 100, // threshold: pressure threshold to allow additional npc action
    multiActionMaxCycles: 3, // threshold: number of max npc actions per round
    waitBetweenNpcActions: 0.5, // wait time before executing possible next npc action (in addition to execution time!)
    // Game Flow
    sceneIdleLength: 3600, // seconds without action until a scene is ended
    lookbackLastSpoken: 30, // how many messages max checking to find who actor has last spoken to
    // AI Parameters
    repeatTimestampAfterSeconds: 600, // seconds after which timestamp is shown again in formatted dialog

    // Game Settings (can be changed by user, e.g. display options)
    idHintsMode: 'auto', // can be "never", "auto", "always"
    idlingBeforeTriggerNpc: 4, // seconds of idling until NPC actions are triggered
    // AI configuration
    aiVendor: 'Gemini',
    aiModel: 'gemini25_flash_lite',
    aiApiKey: import.meta.env.VITE_GEMINI_API_KEY,
    aiSafetyHarassment: safetySettings.harassment,
    aiSafetyHateSpeech: safetySettings.hateSpeech,
    aiSafetySex: safetySettings.sex,
    aiSafetyDangerous: safetySettings.dangerous,

    // Book Settings (can be overwritten by book, e.g. ai settings)
    talkDuration: 30, // seconds that pass per talk action
    moveDurationRoom: 60, // seconds to adjacent room
    moveDurationLocation: 60, // seconds / 1 distance location move
    moveDurationDestination: 3600, // seconds / 1 distance destination move

    // Runtime Variables (e.g. user activity flags)
    idHintsActive: false,
    lightboxImage: null,
    narratorRunning: false,
    narratorRunningMessage: '',
  }),

  getters: {
    // Display id hints? (based on idHintsMode and idHintsActive)
    showIdHints(state) {
      return (
        (state.idHintsMode === 'always') | ((state.idHintsMode === 'auto') & state.idHintsActive)
      )
    },
    aiSafetySettingsGemini(state) {
      return [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: state.aiSafetyHarassment,
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: state.aiSafetyHateSpeech,
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: state.aiSafetySex,
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: state.aiSafetyDangerous,
        },
      ]
    },
  },

  actions: {
    // restore from savefile json
    restoreOptions(data) {
      for (let option of SAVEABLE_OPTIONS) {
        console.log(`restore ${option}`)
        this[option] = data[option]
      }
    },
    // write to json for savefile
    toJSON() {
      let data = {}
      for (let option of SAVEABLE_OPTIONS) {
        data[option] = this[option]
      }
      return data
    },
  },
})
