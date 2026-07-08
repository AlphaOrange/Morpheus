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
}
