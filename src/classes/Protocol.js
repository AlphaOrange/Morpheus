export default class Protocol {
  // messages: {type: ["talk", "hint", "info"],
  //            text: String
  //            present: [] <- names of players present
  //            options: {} <- depends on type
  //           }

  constructor() {
    // this.messages = []
    this.messages = [
      {
        type: 'system',
        text: 'This is the start of the game protocol.',
      },
    ]
    // this.showTypes = ['talk', 'info']
    this.activeTypes = ['talk'] // TEST MODE
    this.showTypes = ['talk', 'info', 'error', 'system'] // TEST MODE
  }

  // Getter: Image or Placeholder
  get dialog() {
    let filtered = this.messages.filter((message) => this.showTypes.includes(message.type))
    return filtered
  }

  // Getter: Last active player
  get recentActor() {
    let filtered = this.messages.filter((message) => this.activeTypes.includes(message.type))
    return filtered[filtered.length - 1].from
  }

  // Actions
  pushMessage(message) {
    this.messages.push(message)
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
