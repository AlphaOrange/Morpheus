import { genericImg } from '@/helpers/utils'
import Character from '@/classes/Character'
import { defaultsBook, defaultsBookSettings } from '@/data/defaults'

export default class ProtoBook {
  room = null

  constructor(rawData) {
    const data = { ...defaultsBook, ...rawData }
    data.settings = { ...defaultsBookSettings, ...(data.settings ?? {}) }
    ;['id', 'title', 'cover', 'description', 'world', 'characters', 'options', 'settings'].forEach(
      (key) => (this[key] = data[key]),
    )
    this.playableCharacters = {}
    for (const char of Object.values(data.characters)) {
      if (char.isPlayable) {
        this.playableCharacters[char.id] = new Character(char, [])
      }
    }
    this.playerCharacters = new Set()
    this.optionValues = {}
    for (const option of this.options) {
      this.optionValues[option.tag] = option.default
    }
  }

  get coverImage() {
    if (this.cover) {
      return `/books/${this.id}/L/${this.cover}`
    } else {
      return genericImg({ filename: 'generic_cover.jpg', size: 'L' })
    }
  }

  get worldImage() {
    if (this.world.image) {
      return `/books/${this.id}/M/${this.world.image}`
    } else {
      return genericImg({ filename: 'generic_world.jpg', size: 'M' })
    }
  }

  get optionTags() {
    let tags = []
    for (let key in this.optionValues) {
      if (this.optionValues[key]) {
        tags.push(key)
      }
    }
    return tags
  }

  // Are all settings correct, ready to start?
  ready() {
    return (
      this.playerCharacters.size >= this.settings.minPlayerChars &&
      this.playerCharacters.size <= this.settings.maxPlayerChars
    )
  }
}
