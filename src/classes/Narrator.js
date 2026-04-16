import NextActionAgent from '@/agents/NextActionAgent'
import TalkAgent from '@/agents/TalkAgent'
import MoveAgent from '@/agents/MoveAgent'
import SleepAgent from '@/agents/SleepAgent'

export default class Narrator {
  // This class handles all AI orchestration
  // Particularly AI talks/actions and all checks and events
  // Narrator does not hold any game data and does not need to be saved with the game

  running = false

  constructor(book, protocol, options) {
    this.options = options
    this.book = book
    this.protocol = protocol
    this.nextActionAgent = new NextActionAgent()
    this.talkAgent = new TalkAgent()
    this.moveAgent = new MoveAgent()
    this.sleepAgent = new SleepAgent()
  }

  // Handle an agent error
  handleError(title, error) {
    this.protocol.pushError({
      time: this.book.time,
      text: error,
      title: title,
    })
    // remove the agent's working message
    this.options.narratorRunning = false
    this.options.narratorRunningMessage = ''
  }

  // TALK Action
  async runTalkAction({ actorId }) {
    this.options.narratorRunningMessage = `${actorId} talking ...`
    const response = await this.talkAgent.run({
      actor: this.book.characters[actorId],
      protocol: this.protocol,
    })

    if (response.error) {
      this.handleError('Error in Talk Agent', response.error)
      return { error: response.error }
    }

    const command = {
      action: 'talk',
      actor: actorId,
      target: response.targetId,
      message: response.message,
    }

    this.options.narratorRunningMessage = ''
    return { command, additionalAction: response.additionalAction }
  }

  // MOVE Action
  async runMoveAction({ actorId }) {
    this.options.narratorRunningMessage = `${actorId} moving ...`
    const response = await this.moveAgent.run({
      actor: this.book.characters[actorId],
      protocol: this.protocol,
    })

    if (response.error) {
      this.handleError('Error in Move Agent', response.error)
      return { error: response.error }
    }

    const command = {
      action: 'move',
      actor: actorId,
      target: response.targetId,
      spec: response.spec,
      message: null, // for NPCs TALK and MOVE currently are always separate actions (this might change with a NextAction Agent, that can decide on MOVE)
    }

    this.options.narratorRunningMessage = ''
    return { command }
  }

  // SLEEP Action
  async runSleepAction({ actorId }) {
    this.options.narratorRunningMessage = `${actorId} tiring ...`
    const response = await this.sleepAgent.run({
      actor: this.book.characters[actorId],
      protocol: this.protocol,
    })

    if (response.error) {
      this.handleError('Error in Sleep Agent', response.error)
      return { error: response.error }
    }

    const command = {
      action: 'sleep',
      actor: actorId,
      seconds: response.duration * 60,
    }

    this.options.narratorRunningMessage = ''
    return { command }
  }

  // Main Action: handle possible NPC actions
  async runNPC({ cycle = 1 }) {
    // store original state to check throughout if run still valid
    const state = { roomId: this.book.roomId }

    // Check first if there even is an NPC present
    if (this.book.room.availableAiCharacters.length === 0) return false

    // Determine next actor
    let { actorId, action } = await this.nextActionAgent.run({
      time: this.book.time,
      room: this.book.room,
      protocol: this.protocol,
      urgentOnly: cycle > 1,
      excludeLastActor: cycle > 1,
    })
    if (!actorId) return false

    // if state changed: return without action
    if (state.roomId !== this.book.roomId) return false

    if (action === 'talk') {
      let response = await this.runTalkAction({ actorId })
      if (state.roomId !== this.book.roomId) return false
      if (response.error) return false
      this.book.executeCommand(response.command)
      action = response.additionalAction
    }

    // return if state changed
    if (state.roomId !== this.book.roomId) return false

    // run additional action
    if (action === 'move') {
      let response = await this.runMoveAction({ actorId })
      if (response.error) return false
      this.book.executeCommand(response.command)
    }
    if (action === 'sleep') {
      let response = await this.runSleepAction({ actorId })
      if (response.error) return false
      this.book.executeCommand(response.command)
    }

    return true
  }

  async run({ force = false } = {}) {
    if (this.running) return

    if (!force) {
      // check if last action was error
      if (this.protocol.lastMessage.type === 'error') {
        return
      }

      // only run if last action was user
      const playerCharIds = Object.keys(this.book.playerCharacters)
      if (!playerCharIds.includes(this.protocol.recentActor)) {
        return
      }
    }

    this.running = true
    this.options.narratorRunningMessage = ''
    this.options.narratorRunning = true

    // Run NPC cycles
    let again
    for (let cycle = 1; cycle <= this.options.multiActionMaxCycles; cycle++) {
      again = false
      again = await this.runNPC({ cycle })
      if (!again) break
      await new Promise((r) => setTimeout(r, this.options.waitBetweenNpcActions * 1000))
    }

    this.running = false
    this.options.narratorRunning = false
    this.options.narratorRunningMessage = ''
  }

  // Main Action: check for goals and states
  // nyi
}
