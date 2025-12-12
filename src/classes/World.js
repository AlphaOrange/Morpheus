export default class World {
  constructor(data) {
    ;['id', 'name', 'description'].forEach((key) => (this[key] = data[key]))
    this._image = data.image
  }

  // Getter: Image or Placeholder
  get image() {
    if (this._image === '') {
      return `generic_world.png`
    } else {
      return this._image
    }
  }
}
