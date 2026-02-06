import Room from '@/classes/Room'

export default class Location {
  rooms = {}
  entry = null

  constructor(data, destination) {
    ;['name', 'description', 'position', 'detour'].forEach((key) => (this[key] = data[key]))

    // Derive unique ID from destination
    this.destination = destination
    this.id = this.destination.id + '/' + this.id

    for (let roomData of Object.values(data.rooms)) {
      let room = new Room(roomData, this)
      this.rooms[room.id] = room
    }

    if (data.entry === '') {
      this.entry = Object.values(this.rooms)[0]
    } else {
      this.entry = this.rooms[data.entry]
    }
    this._image = data.image
  }
  static fromJSON(data, destination) {
    data.image = data._image
    const proto = new Location(data)
    proto.destination = destination
    for (let id in data.rooms) {
      proto.rooms[id] = Room.fromJSON(data.rooms[id], proto)
    }
    proto.entry = proto.rooms[data.entry]
    return proto
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
