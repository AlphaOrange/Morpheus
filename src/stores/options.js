import { defineStore } from 'pinia'

export const useOptionsStore = defineStore('options', {
  state: () => ({
    // Engine Parameters (not to be changed during execution)
    lookbackInfo: 20, // how many messages until an Info message disappears?
    lookbackSystem: 20, // how many messages until a System message disappears?
    lookbackError: 5, // how many messages until an Error message disappears?
    // Game Settings (e.g. display options)
    idHintsMode: 'auto', // can be "never", "auto", "always"
    // Book Settings (e.g. ai settings)
    // ..
    // Functional Settings/Flags (used by game engine)
    idHintsActive: false,
  }),

  getters: {
    // Display id hints? (based on idHintsMode and idHintsActive)
    showIdHints(state) {
      return (
        (state.idHintsMode === 'always') | ((state.idHintsMode === 'auto') & state.idHintsActive)
      )
    },
  },
})
