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

  // Main Action: handle possible NPC actions
  async runNPC({ cycle = 1 }) {
    // Determine next actor
    const { actorId, action } = await this.nextActionAgent.run({
      time: this.book.time,
      room: this.book.room,
      protocol: this.protocol,
      urgentOnly: cycle > 1,
    })
    if (!actorId) return
    if (action === 'talk') {
      // TALK Action
      await this.talkAgent
        .run({
          actor: this.book.characters[actorId],
          room: this.book.room,
          protocol: this.protocol,
        })
        .then((response) => {
          this.book.executeCommand({
            action: 'talk',
            actor: actorId,
            target: response.targetId,
            message: response.message,
          })
        })
    } else if (action === 'move') {
      // MOVE Action
      const { targetId, spec, message } = await this.moveAgent.run({
        actor: this.book.characters[actorId],
        room: this.book.room,
        protocol: this.protocol,
      })
      this.book.executeCommand({
        action: 'move',
        actor: actorId,
        target: targetId,
        spec: spec,
        message: message,
      })
    }
    if (cycle < this.options.multiActionMaxCycles) {
      await new Promise((r) => setTimeout(r, this.options.waitBetweenNpcActions * 1000))
      await this.runNPC({ cycle: cycle + 1 })
    }
  }

  async run() {
    // check if last action was user otherwise return
    const playerCharIds = Object.keys(this.book.playerCharacters)
    if (playerCharIds.includes(this.protocol.recentActor)) {
      await this.runNPC({})
    }
  }

  // Main Action: check for goals and states
  // nyi
}
