import Location from '@/classes/Location'

export default class Destination {
  locations = {}
  entry = null

  constructor(data) {
    ;['id', 'name', 'description', 'position', 'detour'].forEach((key) => (this[key] = data[key]))
    for (let id in data.locations) {
      this.locations[id] = new Location(data.locations[id], this)
    }
    if (data.entry === '') {
      this.entry = Object.values(this.locations)[0]
    } else {
      this.entry = this.locations[data.entry]
    }
    this._image = data.image
  }
  static fromJSON(data) {
    data.image = data._image
    const proto = new Destination(data)
    for (let id in data.locations) {
      proto.locations[id] = Location.fromJSON(data.locations[id], proto)
    }
    proto.entry = proto.locations[data.entry]
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
      locations: this.locations, // stringify will convert location objects
      entry: this.entry.id, // only store id
      _image: this._image,
    }
  }

  // Getter: Image or Placeholder
  get image() {
    if (this._image === '') {
      return `generic_destination.jpg`
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
