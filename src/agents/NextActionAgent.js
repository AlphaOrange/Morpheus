import Agent from '@/agents/Agent'
import { sampleKey } from '@/helpers/utils'
import { useOptionsStore } from '@/stores/options'

export default class NextActionAgent extends Agent {
  // NPC Agent
  // This agent is for choosing which character acts next
  // Currently it does not use any AI
  // Currently only supports TALK
  // Chooses acting ai char using pressure model

  // Agent Input
  // - time: current book time
  // - room: active room
  // - protocol: the Protocol

  // Agent Output
  // - actorId: str, NPC Character ID
  // - action: str, NPC Next Action ("talk", "move")

  constructor() {
    super()
    this.options = useOptionsStore()
  }

  calculatePressure({ chars, messages }) {
    // Initialize pressure
    let pressure = {}
    for (let char of chars) {
      pressure[char.id] = 0
    }

    // Add index to messages
    messages = messages.map((message, index) => ({ ...message, index: index }))

    // Return if no messages
    if (messages.length === 0) {
      for (let char of chars) {
        pressure[char.id] = 100
      }
      return pressure
    }

    // Initialize collectors
    let char_messages = {}
    let last_spoken_to = {}
    let last_index = {}
    for (let char of chars) {
      char_messages[char.id] = []
      last_spoken_to[char.id] = ':all'
      last_index[char.id] = {
        to: -1,
        from: -1,
      }
    }

    // Collect data over messages
    messages.forEach((message) => {
      const { from, to, index } = message
      if (char_messages[from]) {
        char_messages[from].push(message)
      }
      if (last_index[to]) {
        last_index[to].to = index
      } else {
        last_index[to] = { to: index, from: -1 }
      }
      if (last_index[from]) {
        last_index[from].from = index
      } else {
        last_index[from] = { to: -1, from: index }
      }
      last_spoken_to[from] = to
    })

    // Find longest current dialog by traversing backwards
    let dialogActor = ':none'
    let dialogRespondent = ':none'
    let dialogLength = 0
    if (messages.length > 1) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.to !== ':all') {
        dialogActor = lastMessage.to
        dialogRespondent = lastMessage.from
        const dialogMaxLength = Math.min(this.options.maxSearchRunningDialog, messages.length)
        let pos
        for (pos = 2; pos <= dialogMaxLength; ++pos) {
          let message = messages[messages.length - pos]
          if (pos % 2 === 0) {
            if (message.from !== dialogActor || message.to !== dialogRespondent) {
              break
            }
          } else {
            if (message.from !== dialogRespondent || message.to !== dialogActor) {
              break
            }
          }
        }
        dialogLength = pos - 1
      }
    }

    // Calculate pressure
    for (let char of chars) {
      // Criterion 1: has character spoken yet?
      if (char_messages[char.id].length === 0) {
        pressure[char.id] += this.options.pressure_notSpokenYet
      }

      // Criterion 2: has been spoken to but not answered yet
      // we define "not answered yet" as "has not TALKed yet" to avoid permanent pressure traps
      if (last_index[char.id].to > last_index[char.id].from) {
        pressure[char.id] += this.options.pressure_notAnsweredYet
      }

      // Criterion 3: spoken to someone else who hasn't spoken since
      if (last_spoken_to[char.id] !== ':all') {
        if (last_index[last_spoken_to[char.id]].from) {
          if (last_index[last_spoken_to[char.id]].from < last_index[char.id].from) {
            pressure[char.id] += this.options.pressure_spokenToUnresolved
          }
        } else {
          // if player character has not spoken yet we have no entry
          pressure[char.id] += this.options.pressure_spokenToUnresolved
        }
      }

      // Criterion 4: is there a longer running dialog betwen this char and one other char
      if (dialogLength > 0 && dialogActor === char.id) {
        let dialogFactor =
          Math.min(dialogLength - 1, this.options.maxRunningDialogLength) /
          this.options.maxRunningDialogLength
        pressure[char.id] += this.options.pressure_runningDialog * dialogFactor
      }

      // Criterion 5: not spoken in a while
      let notSpokenFactor =
        Math.min(messages.length - last_index[char.id].from - 1, this.options.maxNotSpokenRounds) /
        this.options.maxNotSpokenRounds
      pressure[char.id] += this.options.pressure_notSpokenRounds * notSpokenFactor

      // Pressure cannot be negative
      pressure[char.id] = Math.max(pressure[char.id], 0)
    }

    console.log(pressure)
    return pressure
  }

  async run({ time, room, protocol }) {
    // Get scene and context
    const present = Object.keys(room.characters)
    const scene = protocol.getScene({ time, room: room.id, present })
    const messages = protocol.filterDialog({
      types: 'talk', // all AI actions are TALK actions that can be followed by other types of action
      scene: scene,
    })

    // Check if at least one available that did not just spoke
    const lastTalker = messages[messages.length - 1]?.from
    const npcs = room.presentAiCharacters.filter((char) => char.id !== lastTalker)
    if (npcs.length === 0) {
      return { actorId: null, action: null }
    }

    let actorId
    if (npcs.length === 1) {
      actorId = npcs[0].id
    } else {
      // Determine actor using pressure model
      const pressure = this.calculatePressure({ chars: npcs, messages })
      const maxPressure = Math.max(...Object.values(pressure))
      if (maxPressure <= this.options.pressure_threshold) {
        const noActionProb =
          (1 - maxPressure / this.options.pressure_threshold) * this.options.pressure_noActionProb
        if (Math.random() < noActionProb) {
          return {}
        }
      }
      actorId = sampleKey(pressure)
    }

    return {
      actorId: actorId,
      action: 'talk',
    }
  }
}
