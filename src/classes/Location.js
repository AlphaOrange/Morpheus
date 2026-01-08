import Room from '@/classes/Room'

export default class Location {
  rooms = {}
  entry = null

  constructor(data, destination) {
    ;['id', 'name', 'description', 'position', 'detour'].forEach((key) => (this[key] = data[key]))
    this.destination = destination
    for (let id in data.rooms) {
      this.rooms[id] = new Room(data.rooms[id], this)
    }
    if (data.entry === '') {
      this.entry = Object.values(this.rooms)[0]
    } else {
      this.entry = this.rooms[data.entry]
    }
    this._image = data.image
  }

  // Save object state to JSON
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      position: this.position,
      detour: this.detour,
      destination: this.destination.id, // only store id
      rooms: this.rooms, // stringify will convert room objects
      entry: this.entry.id, // only store id
      _image: this._image,
    }
  }

  // Getter: Image or Placeholder
  get image() {
    if (this._image === '') {
      return `generic_location.jpg`
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
