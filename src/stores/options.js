import { defineStore } from 'pinia'

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
    maxSearchRunningDialog: 20, // how long traverse backwards for finding longest dialog
    maxRunningDialogLength: 8, // running dialog length for max pressure
    maxNotSpokenRounds: 12, // not spoken rounds for max pressure

    // Game Settings (can be changed by user, e.g. display options)
    idHintsMode: 'auto', // can be "never", "auto", "always"

    // Book Settings (can be overwritten by book, e.g. ai settings)
    talkDuration: 30, // seconds that pass per talk action

    // Special Variables (e.g. user activity flags)
    idHintsActive: false,
    lightboxImage: null,
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
      this.idHintsMode = data.idHintsMode
    },
    // write to json for savefile
    toJSON() {
      // only save game settings and book settings
      return {
        idHintsMode: this.idHintsMode,
      }
    },
  },
})
