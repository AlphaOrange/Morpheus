export default class Protocol {
  // messages: {type: ["talk", "hint", "info"],
  //            time: Int
  //            text: String
  //            present: [] <- names of players present
  //            options: {} <- depends on type
  //           }
  // TALK: somebody talks to one or all characters
  // {type: "talk", time, text, room, present, from, to}
  // HINT: ingame hint visible to one or all characters
  // {type: "hint", time, text, room, present, to}
  // SUMMARY: not implemented yet, summaries of TALK/HINT blocks
  // {type: "summary", time_start, time_end, text, room, present}
  // INFO: additional information only visible to user, not to ai
  // {type: "info", time, text, title}
  // SYSTEM: a message describing a program process // debug mode only
  // {type: "system", time, text}
  // ERROR: a program error occurred // debug mode only
  // {type: "error", time, text, title}

  constructor(optionsStore) {
    this.options = optionsStore
    // this.messages = []
    this.messages = [
      {
        type: 'system',
        time: 0,
        text: 'This is the start of the game protocol.',
      },
    ]
    // this.showTypes = ['talk', 'info']
    this.showTypes = ['talk', 'hint', 'info', 'error', 'system'] // TEST MODE
    this.activeTypes = ['talk'] // these action make a character active
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

  // Getter: Dialog messages to show on screen
  get dialog() {
    // Filter by message type
    const filtered = this.messages.filter((message) => this.showTypes.includes(message.type))

    // Filter by message age
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

  // Getter: Last active player
  get recentActor() {
    let filtered = this.messages.filter((message) => this.activeTypes.includes(message.type))
    return filtered[filtered.length - 1].from
  }

  // Actions: add entries
  pushTalk({ time, text, room, present, from, to = ':all' }) {
    this.messages.push({
      type: 'talk',
      time: time,
      text: text,
      room: room,
      present: present,
      from: from,
      to: to,
    })
  }
  pushHint({ time, text, room, present, to = ':all' }) {
    this.messages.push({
      type: 'hint',
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
