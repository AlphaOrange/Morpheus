import Agent from '@/agents/Agent'

export default class NextActionAgent extends Agent {
  // NPC Agent
  // This agent is for choosing which character acts next
  // Currently it does not use any AI
  // Currently only supports TALK
  // Chooses acting ai char using pressure model

  // Agent Input
  // - Room
  // - Protocol

  // Agent Output
  // - NPC Character ID
  // - NPC Next Action ("talk", "move")

  constructor() {
    super()
  }

  calculatePressure({ chars, messages }) {
    const pressure_notSpokenYet = 1
    const pressure_notAnsweredYet = 0.5

    // Add index to messages
    messages = messages.map((message, index) => ({ ...message, index: index }))

    // Initialize some collectors
    let pressure = {}

    // Initialize collectors
    let char_messages = {}
    let last_index = {}
    for (let char of chars) {
      char_messages[char.id] = []
      last_index[char.id] = {
        to: -1,
        from: -1,
      }
    }

    // Collect data over messages
    messages.forEach((message) => {
      const { from, to, index, type } = message

      // Collect messages from character
      if (char_messages[from]) {
        char_messages[from].push(message)
      }

      // Track last message sent TO character
      if (last_index[to]) {
        last_index[to].to = Math.max(last_index[to].to, index)
      }

      // Track last TALK message FROM character
      if (type === 'talk' && last_index[from]) {
        last_index[from].from = Math.max(last_index[from].from, index)
      }
    })

    // Calculate pressure
    for (let char of chars) {
      pressure[char.id] = 0

      // Criterion 1: has character spoken yet?
      if (char_messages[char.id].length === 0) {
        pressure[char.id] += pressure_notSpokenYet
      }

      // Criterion 2: has been spoken to but not answered yet
      // we define "not answered yet" as "has not TALKed yet" to avoid permanent pressure traps
      if (last_index[char.id].to > last_index[char.id].from) {
        pressure[char.id] += pressure_notAnsweredYet
      }
    }

    /*
    const spokenToSomeoneUnresolved = 0
    const runningDialog = 0
    const notSpokenLonger = 0
    return (
      notSpokenYet +
      beenSpokenToUnresolved +
      spokenToSomeoneUnresolved +
      runningDialog +
      notSpokenLonger
    )
    */

    console.log(pressure)
    return pressure
  }

  run({ time, room, protocol }) {
    // Get scene and context
    const present = Object.keys(room.characters)
    const scene = protocol.getScene({ time, room: room.id, present })
    const messages = protocol.filterDialog({
      types: 'talk', // all AI actions are TALK actions that can be followed by other types of action
      room: room.id,
      scene: scene,
    })

    // Check if at least one available
    const npcs = room.presentAiCharacters
    if (npcs.length === 0) {
      return null
    }

    let actorId
    if (npcs.length === 1) {
      actorId = npcs[0].id
    } else {
      // Determine actor using pressure model
      const pressure = this.calculatePressure({ chars: npcs, messages })
      const maxPressure = Math.max(...Object.values(pressure))
      const candidates = Object.keys(pressure).filter((key) => pressure[key] === maxPressure)
      if (candidates.length === 1) {
        actorId = candidates[0]
      } else {
        actorId = candidates[Math.floor(Math.random() * candidates.length)]
      }
    }

    return {
      actorId: actorId,
      action: 'talk',
    }
  }
}
