export default class Room {
  characters = {}

  constructor(data, location) {
    ;['id', 'name', 'description'].forEach((key) => (this[key] = data[key]))
    this.location = location
    this._image = data.image
  }

  // Save object state to JSON
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      location: this.location.id,
      _image: this._image,
      characters: Object.fromEntries(
        Object.entries(this.characters).map(([key, obj]) => [key, obj.id]),
      ), // only store ids
    }
  }

  // Getter: Image or Placeholder
  get image() {
    if (this._image === '') {
      return `generic_room.jpg`
    } else {
      return this._image
    }
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
