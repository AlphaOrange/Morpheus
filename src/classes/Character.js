export default class Character {
  room = null
  controlledBy = null
  arrivalTime = 0
  arrivalTarget = null

  constructor(data) {
    ;['id', 'name', 'isPlayable', 'isNSC', 'description', 'gender', 'age', 'profession'].forEach(
      (key) => (this[key] = data[key]),
    )
    this._image = data.image
    this.start = this.start.destination + '/' + this.start.location + '/' + this.start.room
    // data.load_states
    // data.load_agendas
  }
  static fromJSON(data) {
    data.image = data._image
    const proto = new Character(data)
    proto.room = data.room // Note: this gets rewired to room ref in book load/restore
    proto.controlledBy = data.controlledBy
    proto.arrivalTime = data.arrivalTime
    proto.arrivalTarget = data.arrivalTarget
    return proto
  }

  // Save object state to JSON
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      isPlayable: this.isPlayable,
      isNSC: this.isNSC,
      description: this.description,
      gender: this.gender,
      age: this.age,
      profession: this.profession,
      start: this.start,
      _image: this._image,
      room: this.room === null ? null : this.room.id,
      controlledBy: this.controlledBy,
      arrivalTime: this.arrivalTime,
      arrivalTarget: this.arrivalTarget === null ? null : this.arrivalTarget.id,
    }
  }

  // Getter: Image or Placeholder
  get image() {
    if (this._image === '') {
      if (['male', 'female'].includes(this.gender)) {
        return `generic_${this.gender}.jpg`
      } else {
        return `generic_diverse.jpg`
      }
    } else {
      return this._image
    }
  }

  // Getter: Gender+Age combination
  get demo() {
    let demo
    if (this.gender === 'male') {
      demo = '♂'
    } else {
      demo = '♀'
    }
    return demo + this.age
  }

  // Move character to another room
  moveToRoom(room, arrivalTime = 0) {
    if (this.room) {
      this.room.removeCharacter(this)
    }
    this.room = null
    if (room) {
      this.arrivalTarget = room
      this.arrivalTime = arrivalTime
    }
  }
  checkForArrival(time) {
    if ((this.arrivalTime >= 0) & (time >= this.arrivalTime)) {
      this.room = this.arrivalTarget
      this.arrivalTime = -1
      this.room.addCharacter(this)
      return true
    }
    return false
  }
}
