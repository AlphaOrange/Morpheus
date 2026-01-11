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

  // Getter: Image or Placeholder
  get image() {
    if (this._image === '') {
      return `generic_world.jpg`
    } else {
      return this._image
    }
  }
}
