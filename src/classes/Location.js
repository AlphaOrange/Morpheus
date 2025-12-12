import Room from '@/classes/Room'

export default class Location {
  rooms = {}

  constructor(data, destination) {
    ;['id', 'name', 'description', 'position'].forEach((key) => (this[key] = data[key]))
    this.destination = destination
    for (let id in data.rooms) {
      this.rooms[id] = new Room(data.rooms[id], this)
    }
    if (data.entry) {
      this.entry = this.rooms[data.entry]
    } else {
      this.entry = Object.values(this.rooms)[0]
    }
    this._image = data.image
  }

  // Getter: Image or Placeholder
  get image() {
    if (this._image === '') {
      return `generic_location.png`
    } else {
      return this._image
    }
  }

  // Getters: Available Move Targets
  get availableLocations() {
    return Object.values(this.destination.locations).filter((loc) => loc.id !== this.id)
  }

  // Rooms with player characters
  get activeRooms() {
    return Object.values(this.rooms).filter((room) => room.active)
  }
}
