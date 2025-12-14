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
        text: 'This is a system message. It can never be seen by any character',
        subtype: 'debug',
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
}
