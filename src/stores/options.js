import { defineStore } from 'pinia'
import OPTIONS from '@/data/options'

// these options will be stored and restored with saving/loading books
const SAVEABLE_OPTIONS = OPTIONS.filter((opt) => opt[2]).map((opt) => opt[0])

// these options are available to the user to change
const USER_OPTIONS = OPTIONS.filter((opt) => opt[3]).map((opt) => opt[0])

export const useOptionsStore = defineStore('options', {
  state: () => {
    const state = {}
    OPTIONS.forEach((opt) => (state[opt[0]] = opt[1]))
    return state
  },

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
