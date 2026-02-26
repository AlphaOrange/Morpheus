import { genericImg, bookImg } from '@/helpers/utils'

export default class World {
  constructor(data) {
    ;['id', 'name', 'description'].forEach((key) => (this[key] = data[key]))
    this._image = data.image
  }
  static fromJSON(data) {
    data._image = data.image
    const proto = new World(data)
    return proto
  }

  // Save object state to JSON
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      _image: this._image,
    }
  }

  // Backbone for image getters
  getImage(size) {
    if (this._image === '') {
      return genericImg({ filename: 'generic_world.jpg', size })
    } else {
      return bookImg({ filename: this._image, size })
    }
  }

  // Getter: Image
  get imageFull() {
    return this.getImage('full')
  }
  get imageL() {
    return this.getImage('L')
  }
  get imageM() {
    return this.getImage('M')
  }
  get imageS() {
    return this.getImage('S')
  }
}
