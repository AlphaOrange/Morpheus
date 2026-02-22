import NextActionAgent from '@/agents/NextActionAgent'
import TalkAgent from '@/agents/TalkAgent'
import MoveAgent from '@/agents/MoveAgent'

export default class Narrator {
  // This class handles all AI orchestration
  // Particularly AI talks/actions and all checks and events
  // Narrator does not hold any game data and does not need to be saved with the game

  constructor(book, protocol, options) {
    this.options = options
    this.book = book
    this.protocol = protocol
    this.nextActionAgent = new NextActionAgent()
    this.talkAgent = new TalkAgent()
    this.moveAgent = new MoveAgent()
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
      room: this.book.room, // TODO: do we need this? It's actor.room
      protocol: this.protocol,
    })

    if (response.error) {
      this.handleError('Error in Talk Agent', response.error)
      return { error: response.error }
    }

    this.book.executeCommand({
      action: 'talk',
      actor: actorId,
      target: response.targetId,
      message: response.message,
    })

    return { additionalAction: response.additionalAction }
  }

  // MOVE Action
  async runMoveAction({ actorId }) {
    this.options.narratorRunningMessage = `${actorId} moving ...`
    const response = await this.moveAgent.run({
      actor: this.book.characters[actorId],
      room: this.book.room, // TODO: do we need this? It's actor.room
      protocol: this.protocol,
    })

    if (response.error) {
      this.handleError('Error in Move Agent', response.error)
      return { error: response.error }
    }

    this.book.executeCommand({
      action: 'move',
      actor: actorId,
      target: response.targetId,
      spec: response.spec,
      message: null, // for NPCs TALK and MOVE currently are always separate actions (this might change with a NextAction Agent, that can decide on MOVE)
    })

    return {}
  }

  // Main Action: handle possible NPC actions
  async runNPC({ cycle = 1 }) {
    // inform options
    this.options.narratorRunningMessage = ''
    this.options.narratorRunning = true

    // Determine next actor
    let { actorId, action } = await this.nextActionAgent.run({
      time: this.book.time,
      room: this.book.room,
      protocol: this.protocol,
      urgentOnly: cycle > 1,
    })
    if (!actorId) return
    if (action === 'talk') {
      let response = await this.runTalkAction({ actorId })
      if (response.error) return
      action = response.additionalAction // this now triggers additional action
    }
    if (action === 'move') {
      let response = await this.runMoveAction({ actorId })
      if (response.error) return
    }

    // start for new cycle
    if (cycle < this.options.multiActionMaxCycles) {
      this.options.narratorRunning = false
      await new Promise((r) => setTimeout(r, this.options.waitBetweenNpcActions * 1000))
      await this.runNPC({ cycle: cycle + 1 })
    }

    // inform options (fallback)
    this.options.narratorRunning = false
    this.options.narratorRunningMessage = ''
  }

  async run() {
    // check if last action was error
    if (this.protocol.lastMessage.type === 'error') {
      return
    }

    // only run if last action was user
    const playerCharIds = Object.keys(this.book.playerCharacters)
    if (playerCharIds.includes(this.protocol.recentActor)) {
      await this.runNPC({})
    }
  }

  // Main Action: check for goals and states
  // nyi
}
