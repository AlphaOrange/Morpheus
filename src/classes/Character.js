import { genericImg, bookImg } from '@/helpers/utils'

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
      'isNPC',
      'description',
      'gender',
      'age',
      'profession',
      'body',
      'mind',
      'clothing',
      'appearance',
      'background',
      'wants',
    ].forEach((key) => (this[key] = data[key]))
    this._image = data.image
    this.start = data.start
      ? data.start.destination + '/' + data.start.location + '/' + data.start.room
      : null
    this.language = data?.language
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
      isNPC: this.isNPC,
      description: this.description,
      gender: this.gender,
      age: this.age,
      profession: this.profession,
      body: this.body,
      mind: this.mind,
      clothing: this.clothing,
      appearance: this.appearance,
      background: this.background,
      wants: this.wants,
      start: this.start,
      _image: this._image,
      room: this.room === null ? null : this.room.id,
      controlledBy: this.controlledBy,
      arrivalTime: this.arrivalTime,
      arrivalTarget: this.arrivalTarget === null ? null : this.arrivalTarget.id,
    }
  }

  // Backbone for image getters
  getImage(size) {
    if (this._image === '') {
      let filename
      if (['male', 'female'].includes(this.gender)) {
        filename = `generic_${this.gender}.jpg`
      } else {
        filename = `generic_diverse.jpg`
      }
      return genericImg({ filename, size })
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
