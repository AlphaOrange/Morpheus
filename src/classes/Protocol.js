export default class Protocol {
  // messages: {type: ["talk", "hint", "info"],
  //            time: Int
  //            text: String
  //            present: [] <- names of players present
  //            options: {} <- depends on type
  //           }
  // TALK: somebody talks to one or all characters
  // {type: "talk", scene, time, text, room, present, from, to}
  // HINT: ingame hint visible to one or all characters
  // {type: "hint", scene, time, text, room, present, to}
  // SUMMARY: not implemented yet, summaries of TALK/HINT blocks
  // {type: "summary", scene, time_start, time_end, text, room, present}
  // INFO: additional information only visible to user, not to ai
  // {type: "info", time, text, title}
  // SYSTEM: a message describing a program process // debug mode only
  // {type: "system", time, text}
  // ERROR: a program error occurred // debug mode only
  // {type: "error", time, text, title}

  // TODO: nearly everywhere here room should be roomId

  typeFilters = {
    // this.showTypes = ['talk', 'info'] // show these in dialog display
    show: ['talk', 'hint', 'info', 'error', 'system', 'summary'], // TEST MODE
    context: ['talk', 'hint', 'summary'], // give these to agent for historal context
    scene: ['talk', 'hint', 'summary'], // these count for scene building
    active: ['talk'], // these action make a character active
    talk: ['talk'],
  }

  constructor(optionsStore) {
    this.options = optionsStore
    this.scene = 0
    // this.messages = []
    this.messages = [
      {
        type: 'system',
        time: 0,
        text: 'This is the start of the game protocol.',
      },
    ]
  }
  static fromJSON(data, optionsStore) {
    const proto = new Protocol(optionsStore)
    proto.messages = data.messages
    return proto
  }

  // Save object state to JSON
  toJSON() {
    return {
      messages: this.messages,
    }
  }

  // Construct dialog from messages
  filterDialog({ types, present, room, since, scene }) {
    let filtered = this.messages
    // Filter by cutoff point
    if (since) {
      if (since.type === 'time') {
        filtered = filtered.filter((message) => message.time >= since.threshold)
      }
    }

    // Filter by scene
    if (scene) {
      filtered = filtered.filter((message) => {
        if (!this.typeFilters['scene'].includes(message.type)) {
          return false // no scene information
        }
        if (message.scene !== scene) {
          return false // wrong scene
        }
        return true
      })
    }

    // Filter by message type
    filtered = filtered.filter((message) => this.typeFilters[types].includes(message.type))

    // Filter by present character
    if (present) {
      filtered = filtered.filter((message) => {
        if (!['talk', 'hint', 'summary'].includes(message.type)) {
          return false // no present stored
        }
        if (!message.present.includes(present.id)) {
          return false // char not present
        }
        if (message.type === 'hint' && message.to !== present.id) {
          return false // hint not readable for char
        }
        return true
      })
    }

    // Filter by room ID
    if (room) {
      filtered = filtered.filter((message) => {
        if (!['talk', 'hint', 'summary'].includes(message.type)) {
          return false // no room stored
        }
        return message.room === room
      })
    }

    // Filter additional info by message age
    const len = filtered.length
    let dialog = []
    for (let i = 0; i < filtered.length; i++) {
      if (filtered[i].type === 'info') {
        if (i >= len - this.options.lookbackInfo) {
          dialog.push(filtered[i])
        }
      } else if (filtered[i].type === 'system') {
        if (i >= len - this.options.lookbackSystem) {
          dialog.push(filtered[i])
        }
      } else if (filtered[i].type === 'error') {
        if (i >= len - this.options.lookbackError) {
          dialog.push(filtered[i])
        }
      } else {
        dialog.push(filtered[i])
      }
    }
    return dialog
  }

  // Standard dialog for display
  get dialog() {
    return this.filterDialog({ types: 'show' })
  }

  // Getter: Last active player
  get recentActor() {
    let filtered = this.messages.filter((message) => this.typeFilters.active.includes(message.type))
    return filtered[filtered.length - 1]?.from || ''
  }

  // Check for new scene and return scene number
  getScene({ time, room, present }) {
    // Check if there is a running scene in the room
    const relevantDialog = this.filterDialog({
      types: 'scene',
      room,
      since: time - 3600,
    }) // TODO: 3600 -> from options
    if (relevantDialog.length === 0) {
      // start new scene
      this.scene = this.scene + 1
      return this.scene
    }
    // Check if there is a character continuation
    const lastMessage = relevantDialog.pop()
    const commonChars = lastMessage.present.filter((char) => present.includes(char))
    if (commonChars.length === 0) {
      // start new scene
      this.scene = this.scene + 1
      return this.scene
    }
    // continue scene
    return lastMessage.scene
  }

  // Actions: add entries
  pushTalk({ time, text, room, present, from, to = ':all' }) {
    const scene = this.getScene({ time, room, present })
    this.messages.push({
      type: 'talk',
      scene: scene,
      time: time,
      text: text,
      room: room,
      present: present,
      from: from,
      to: to,
    })
  }
  pushHint({ time, text, room, present, to = ':all' }) {
    const scene = this.getScene({ time, room, present })
    this.messages.push({
      type: 'hint',
      scene: scene,
      time: time,
      text: text,
      room: room,
      present: present,
      to: to,
    })
  }
  pushInfo({ time, text, title = 'Info' }) {
    this.messages.push({
      type: 'info',
      time: time,
      text: text,
      title: title,
    })
  }
  pushSystem({ time, text }) {
    this.messages.push({
      type: 'system',
      time: time,
      text: text,
    })
  }
  pushError({ time, text, title = 'Error' }) {
    this.messages.push({
      type: 'error',
      time: time,
      text: text,
      title: title,
    })
  }

  // Who has character charID last spoken to
  lastSpokenTo(charID) {
    const LOOKBACK_LASTSPOKEN = 30 // TODO: move to config file
    for (
      let i = this.messages.length - 1;
      i > Math.max(0, this.messages.length - LOOKBACK_LASTSPOKEN);
      i--
    ) {
      if (this.messages[i].type === 'talk') {
        if (this.messages[i].from === charID) {
          return this.messages[i].to
        }
      }
    }
    return null
  }
}
