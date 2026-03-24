import { genericImg, bookImg } from '@/helpers/utils'
import { distancePeriodText } from '@/helpers/utils'
import { defaultsRoom } from '@/data/defaults'

export default class Room {
  type = 'room'
  characters = {}

  constructor(rawData, location, full = true) {
    const data = { ...defaultsRoom, ...rawData }
    ;['name', 'description'].forEach((key) => (this[key] = data[key]))

    // Derive unique ID from location
    this.location = location
    this.id = this.location.id + '/' + data.id
    this.commandId = data.id // short id only used in command; not unique overall!
    this._image = data.image
    if (full) this.fullConstructor(data)
  }

  // only to be used in original construction, not restore
  fullConstructor(data) {
    // currently empty bc rooms neither have subrooms nor entry rooms
  }

  static fromJSON(data, location) {
    data.image = data._image
    const proto = new Room(data, location, false)
    proto.id = data.id
    proto.commandId = data.commandId
    for (let id in data.characters) {
      proto.characters[id] = null // will be filled from the outside
    }
    return proto
  }

  // Save object state to JSON
  toJSON() {
    return {
      id: this.id,
      commandId: this.commandId,
      name: this.name,
      description: this.description,
      location: this.location.id,
      _image: this._image,
      characters: Object.fromEntries(
        Object.entries(this.characters).map(([key, obj]) => [key, obj.id]),
      ), // only store ids
    }
  }

  // Backbone for image getters
  getImage(size) {
    if (this._image === '') {
      return genericImg({ filename: 'generic_room.jpg', size })
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

  // Getters: Present Characters
  get presentPlayerCharacters() {
    return Object.values(this.characters).filter((char) => char.controlledBy === 'player')
  }
  get presentAiCharacters() {
    return Object.values(this.characters).filter((char) => char.controlledBy === 'ai')
  }
  // Has present player characters
  get numberOfPlayers() {
    return this.presentPlayerCharacters.length
  }
  get active() {
    return this.numberOfPlayers > 0
  }

  // Getters: Available Move Targets
  get availableRooms() {
    return Object.values(this.location.rooms).filter((room) => room.id !== this.id)
  }
  get availableLocations() {
    return this.location.availableLocations
  }

  // Describe where one can go from here
  describeMoveOptions() {
    const avRooms = this.availableRooms
      .map((room) => {
        const time = distancePeriodText(this, room)
        return `- ${room.name} [Type: room, ID: ${room.commandId}]: ${room.description} [takes time: ${time}]`
      })
      .join('\n')
    const avLocations = this.availableLocations
      .map((loc) => {
        const time = distancePeriodText(this, loc)
        return `- ${loc.name} [Type: location, ID: ${loc.commandId}]: ${loc.description} [takes time: ${time}]`
      })
      .join('\n')
    const description = `**${this.name}**
${this.description}

Rooms you can go to:
${avRooms}

Locations you can go to:
${avLocations}`
    return description
  }

  // Adding and removing characters
  addCharacter(character) {
    this.characters[character.id] = character
  }
  removeCharacter(character) {
    delete this.characters[character.id]
  }
  isInRoom(charID) {
    return Object.values(this.characters)
      .map((char) => char.id)
      .includes(charID)
  }
}
