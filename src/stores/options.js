import { defineStore } from 'pinia'

// these options will be stored and restored with saving/loading books
const SAVEABLE_OPTIONS = [
  // User Settings
  'idHintsMode',
  'idlingBeforeTriggerNpc',
  // AI Settings
  'aiVendor',
  'aiModel',
  'aiApiKey',
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
    maxSearchRunningDialog: 20, // how long traverse backwards for finding longest dialog //TODO: same as next?
    maxRunningDialogLength: 8, // running dialog length for max pressure
    maxNotSpokenRounds: 12, // not spoken rounds for max pressure
    multiActionThreshold: 100, // threshold: pressure threshold to allow additional npc action
    multiActionMaxCycles: 3, // threshold: number of max npc actions per round
    waitBetweenNpcActions: 0.5, // wait time before executing possible next npc action (in addition to execution time!)
    // AI Parameters
    repeatTimestampAfterSeconds: 600, // seconds after which timestamp is shown again in formatted dialog

    // Game Settings (can be changed by user, e.g. display options)
    idHintsMode: 'auto', // can be "never", "auto", "always"
    idlingBeforeTriggerNpc: 4, // seconds of idling until NPC actions are triggered
    // AI configuration
    aiVendor: 'Gemini',
    aiModel: 'gemini25_flash_lite',
    aiApiKey: import.meta.env.VITE_GEMINI_API_KEY,

    // Book Settings (can be overwritten by book, e.g. ai settings)
    talkDuration: 30, // seconds that pass per talk action
    moveDurationRoom: 60, // seconds to adjacent room
    moveDurationLocation: 60, // seconds / 1 distance location move
    moveDurationDestination: 3600, // seconds / 1 distance destination move

    // Special Variables (e.g. user activity flags)
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
