import { genericImg, bookImg } from '@/helpers/utils'
import { defaultsCharacter } from '@/data/defaults'
import State from '@/classes/State'

export default class Character {
  room = null
  states = []
  controlledBy = null
  arrivalTime = 0
  arrivalTarget = null

  constructor(rawData) {
    const data = { ...defaultsCharacter, ...rawData }
    ;[
      'id',
      'name',
      'isPlayable',
      'isNPC',
      'description',
      'description_player',
      'gender',
      'age',
      'profession',
      'behavior',
      'body',
      'clothing',
      'appearance',
      'background',
    ].forEach((key) => (this[key] = data[key]))
    this._image = data.image
    this.start = data.start
      ? data.start.destination + '/' + data.start.location + '/' + data.start.room
      : null
    if (!Array.isArray(data.states)) {
      data.states = Object.values(data.states)
    }
    for (let state of data.states) {
      this.states.push(new State(state))
    }
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
      description_player: this.description_player,
      gender: this.gender,
      age: this.age,
      profession: this.profession,
      behavior: this.behavior,
      body: this.body,
      clothing: this.clothing,
      appearance: this.appearance,
      background: this.background,
      start: this.start,
      _image: this._image,
      room: this.room === null ? null : this.room.id,
      states: this.states,
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

  // Getter: Descriptions
  get stateEffects() {
    return this.states.map((state) => state.effect).join(' ')
  }
  get selectionDescription() {
    // for selection menu
    return this.description_player === '' ? this.description : this.description_player
  }
  get selfDescription() {
    // for this character's prompts
    return `${this.name} (${this.gender}, ${this.age}, ${this.profession})
${this.background}
${this.body}, ${this.clothing}, ${this.appearance}
Behavioral instructions: ${this.behavior}
${this.stateEffects}`
  }
  get externalDescription() {
    // for other character's prompts
    return `${this.name} (ID: ${this.id}), ${this.profession}
${this.body}, ${this.clothing}, ${this.appearance}`
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

  // Pass time and check for events
  passTime(startTime, duration) {
    const events = []

    // Check for arrival
    if ((this.arrivalTime >= 0) & (startTime + duration >= this.arrivalTime)) {
      this.room = this.arrivalTarget
      this.arrivalTime = -1
      this.room.addCharacter(this)
      events.push({ type: 'arrival', char: this, room: this.room })
    }

    return events
  }
}
