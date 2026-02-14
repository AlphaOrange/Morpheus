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

    let pressure = {}
    let char_messages = {}

    for (let char of chars) {
      char_messages[char.id] = messages.filter((message) => message.from === char.id)
    }

    // Criterion 1: has character spoken yet?
    for (let char of chars) {
      if (char_messages[char.id].length === 0) {
        pressure[char.id] = pressure_notSpokenYet
      } else {
        pressure[char.id] = 0
      }
    }

    /*
    const beenSpokenToUnresolved = 0
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

    return pressure
  }

  run({ time, room, protocol }) {
    // Get scene and context
    const present = Object.keys(room.characters)
    const scene = protocol.getScene({ time, room: room.id, present })
    const messages = protocol.filterDialog({
      types: 'active',
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
