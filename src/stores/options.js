import { defineStore } from 'pinia'
import { safetySettings } from '@/data/llm'

// these options will be stored and restored with saving/loading books
const SAVEABLE_OPTIONS = [
  // User Settings
  'idHintsMode',
  'idlingBeforeTriggerNpc',
  'useAiForSavegameSummary',
  'useCompactButtons',
  'legalAllowAI',
  'legalAllowLocalStorage',
  // AI Settings
  'aiVendor',
  'aiModel',
  'aiApiKey',
  'aiApiKeyAllowSave',
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

// these options are available to the user to change
// (does not list aiApiKey to not expose in dialog)
const USER_OPTIONS = [
  'idHintsMode',
  'idlingBeforeTriggerNpc',
  'useAiForSavegameSummary',
  'useCompactButtons',
  'aiVendor',
  'aiModel',
  'aiApiKeyAllowSave',
  'aiSafetyHarassment',
  'aiSafetyHateSpeech',
  'aiSafetySex',
  'aiSafetyDangerous',
]

export const useOptionsStore = defineStore('options', {
  state: () => ({
    // Engine Parameters (cannot be changed, e.g. ui settings)
    // Display parameters
    lookbackInfo: 20, // how many messages until an Info message disappears?
    lookbackSystem: 20, // how many messages until a System message disappears?
    lookbackError: 5, // how many messages until an Error message disappears?
    compactButtonsThreshold: 20, // number of buttons for activating compact buttons display
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
    useAiForSavegameSummary: false, // if true use ai agent on save, otherwise use description as summary
    useCompactButtons: true, // use compact buttons on cluttered action bar
    // AI configuration
    aiVendor: 'Google',
    aiModel: 'gemini-2.5-flash-lite',
    aiApiKey: import.meta.env.VITE_GEMINI_API_KEY,
    aiApiKeyAllowSave: import.meta.env.VITE_ALLOW_SAVE_KEY,
    aiSafetyHarassment: safetySettings.harassment,
    aiSafetyHateSpeech: safetySettings.hateSpeech,
    aiSafetySex: safetySettings.sex,
    aiSafetyDangerous: safetySettings.dangerous,
    // Legal settings
    legalAllowAI: import.meta.env.VITE_GENERAL_CONSENT,
    legalAllowLocalStorage: import.meta.env.VITE_GENERAL_CONSENT,

    // Book Settings (can be overwritten by book, e.g. ai settings)
    talkDuration: 30, // seconds that pass per talk action
    moveDurationRoom: 60, // seconds to adjacent room
    moveDurationLocation: 60, // seconds / 1 distance location move
    moveDurationDestination: 3600, // seconds / 1 distance destination move

    // Runtime Variables (e.g. user activity flags)
    idHintsActive: false,
    lightbox: {
      component: null,
      props: {},
    },
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
    userOptionsText(state) {
      let options = []
      for (let option of USER_OPTIONS) {
        options.push(`${option}: ${state[option]}`)
      }
      return options.join('\n')
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
        this[option] = data[option]
      }
    },
    // write to json for savefile
    toJSON() {
      let data = {}
      for (let option of SAVEABLE_OPTIONS) {
        data[option] = this[option]
      }
      if (!this.aiApiKeyAllowSave) data.aiApiKey = ''
      return data
    },
    // set value for option
    setOption(option, value) {
      if (USER_OPTIONS.includes(option)) {
        const requiredType = typeof this[option]
        if (requiredType === 'boolean') {
          this[option] = value === 'true'
        } else if (requiredType === 'number') {
          this[option] = Number(value)
        } else if (requiredType === 'string') {
          this[option] = value
        } else {
          throw new Error('Internal Error')
        }
      } else {
        throw new Error('Option name unknown or cannot be changed.')
      }
    },
  },
})
