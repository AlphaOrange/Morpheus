export default class Character {
  room = null
  controlledBy = null
  arrivalTime = 0
  arrivalTarget = null

  constructor(data) {
    ;[
      'id',
      'name',
      'isPlayable',
      'isNSC',
      'description',
      'gender',
      'age',
      'profession',
      'start',
    ].forEach((key) => (this[key] = data[key]))
    this._image = data.image
    // data.load_states
    // data.load_agendas
  }

  // Getter: Image or Placeholder
  get image() {
    if (this._image === '') {
      return `generic_${this.gender}.png`
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
