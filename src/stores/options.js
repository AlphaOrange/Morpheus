import { defineStore } from 'pinia'

export const useOptionsStore = defineStore('options', {
  state: () => ({
    // Game Settings (e.g. display options)
    idHintsMode: 'auto', // can be "never", "auto", "always"
    // Book Settings (e.g. ai settings)
    // ..
    // Functional Settings (used by game engine)
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
