import Location from '@/classes/Location'

export default class Destination {
  locations = {}

  constructor(data) {
    ;['id', 'name', 'description', 'position'].forEach((key) => (this[key] = data[key]))
    for (let id in data.locations) {
      this.locations[id] = new Location(data.locations[id], this)
    }
    if (data.entry) {
      this.entry = this.locations[data.entry]
    } else {
      this.entry = this.locations[0]
    }
    this._image = data.image
  }

  // Getter: Image or Placeholder
  get image() {
    if (this._image === '') {
      return `generic_destination.png`
    } else {
      return this._image
    }
  }

  // Rooms with player characters
  get activeRooms() {
    return Object.values(this.locations).reduce((acc, location) => {
      return acc.concat(location.activeRooms)
    }, [])
  }
}
