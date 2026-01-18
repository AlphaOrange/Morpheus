import { defineStore } from 'pinia'
import { useOptionsStore } from '@/stores/options'
import { useBookStore } from '@/stores/book'

// Initial load of saveData
const saveString = localStorage.getItem('savegame')
const saveData = saveString === null ? null : JSON.parse(saveString)

export const useShelfStore = defineStore('shelf', {
  state: () => ({
    books: [],
    saveData: saveData,
  }),

  getters: {
    options() {
      return useOptionsStore()
    },
    book() {
      return useBookStore()
    },
    hasSaveData() {
      return saveData !== null
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
      this.saveData = JSON.parse(saveString)
    },
    loadBook() {
      const saveString = localStorage.getItem('savegame')
      const saveData = JSON.parse(saveString)
      this.options.restoreOptions(saveData.options)
      this.book.restoreBook(saveData.book)
    },
  },
})
