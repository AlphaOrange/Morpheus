import { defineStore } from 'pinia'
import { useOptionsStore } from '@/stores/options'
import { useBookStore } from '@/stores/book'

export const useShelfStore = defineStore('shelf', {
  state: () => ({
    books: [],
    savegame: null,
  }),

  getters: {
    options() {
      return useOptionsStore()
    },
    book() {
      return useBookStore()
    },
  },

  actions: {
    async loadShelf() {
      try {
        const response = await fetch(`books.json`)
        this.books = await response.json()
      } catch (error) {
        console.error('Error fetching shelf data', error)
      }
    },
    saveBook() {
      const saveString = JSON.stringify({ options: this.options, book: this.book })
      localStorage.setItem('savegame', saveString)
    },
    loadBook() {
      const saveString = localStorage.getItem('savegame')
      const saveData = JSON.parse(saveString)
      this.options.restoreOptions(saveData.options)
      this.book.restoreBook(saveData.book)
    },
  },
})
