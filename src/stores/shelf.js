import { defineStore } from 'pinia'

export const useShelfStore = defineStore('shelf', {
  state: () => ({
    books: [],
  }),

  actions: {
    async loadShelf() {
      try {
        const response = await fetch(`books.json`)
        this.books = await response.json()
      } catch (error) {
        console.error('Error fetching shelf data', error)
      }
    },
  },
})
