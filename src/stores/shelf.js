import { markRaw } from 'vue'
import { defaultsBook } from '@/data/defaults'
import { defineStore } from 'pinia'
import { useOptionsStore } from '@/stores/options'
import { useBookStore } from '@/stores/book'
import ThePopupLocalStorage from '@/components/ThePopupLocalStorage.vue'

// Initial load of saveData
const saveString = localStorage.getItem('savegame')
const saveData = saveString === null ? null : JSON.parse(saveString)

export const useShelfStore = defineStore('shelf', {
  state: () => ({
    books: [],
    saveData: saveData,
    tokenUsage: 0,
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
        const response = await fetch(`/books/books.json`)
        this.books = await response.json()
        for (let bookId of Object.keys(this.books)) {
          this.books[bookId] = { ...defaultsBook, ...this.books[bookId] }
        }
      } catch (error) {
        console.error('Error fetching shelf data', error)
      }
    },
    async saveBook() {
      // check if permission for localStorage was given
      if (!this.options.legalAllowLocalStorage) {
        this.options.lightbox = {
          component: markRaw(ThePopupLocalStorage),
          props: {},
        }
        return
      }
      await this.book.createSaveSummary()
      try {
        const saveString = JSON.stringify({ options: this.options, book: this.book })
        localStorage.setItem('savegame', saveString)
        this.saveData = JSON.parse(saveString)
        this.book.protocol.pushSystem({
          time: this.book.time,
          text: 'Book progress successfully saved.',
        })
      } catch {
        this.book.protocol.pushError({
          time: this.book.time,
          title: 'Save Error',
          text: 'There was an error when trying to save the book progress.',
        })
      }
    },
    loadBook() {
      const saveString = localStorage.getItem('savegame')
      const saveData = JSON.parse(saveString)
      this.options.restoreOptions(saveData.options)
      this.book.restoreBook(saveData.book)
    },
  },
})
