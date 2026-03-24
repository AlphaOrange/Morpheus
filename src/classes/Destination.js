import { genericImg, bookImg } from '@/helpers/utils'
import { defaultsDestination } from '@/data/defaults'
import Location from '@/classes/Location'

export default class Destination {
  type = 'destination'
  locations = {}
  entry = null

  constructor(rawData, full = true) {
    const data = { ...defaultsDestination, ...rawData }
    ;['id', 'name', 'description', 'position', 'detour'].forEach((key) => (this[key] = data[key]))
    this.commandId = data.id // for destinations commandId = id on purpose
    this._image = data.image
    if (full) this.fullConstructor(data)
  }

  // only to be used in original construction, not restore
  fullConstructor(data) {
    for (let locationData of Object.values(data.locations)) {
      let location = new Location(locationData, this)
      this.locations[location.id] = location
    }
    if (data.entry === '') {
      this.entry = Object.values(this.locations)[0]
    } else {
      this.entry = this.locations[this.id + '/' + data.entry]
    }
  }

  static fromJSON(data) {
    data.image = data._image
    const proto = new Destination(data, false)
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
      commandId: this.commandId,
      name: this.name,
      description: this.description,
      position: this.position,
      detour: this.detour,
      locations: this.locations, // stringify will convert location objects
      entry: this.entry.id, // only store id
      _image: this._image,
    }
  }

  // Backbone for image getters
  getImage(size) {
    if (this._image === '') {
      return genericImg({ filename: 'generic_destination.jpg', size })
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

  // Rooms with player characters
  get activeRooms() {
    return Object.values(this.locations).reduce((acc, location) => {
      return acc.concat(location.activeRooms)
    }, [])
  }
}
