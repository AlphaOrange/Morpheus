import NextActionAgent from '@/agents/NextActionAgent'
import TalkAgent from '@/agents/TalkAgent'
import MoveAgent from '@/agents/MoveAgent'

export default class Narrator {
  // This class handles all AI orchestration
  // Particularly AI talks/actions and all checks and events
  // Narrator does not hold any game data and does not need to be saved with the game

  constructor(book, protocol) {
    this.book = book
    this.protocol = protocol
    this.nextActionAgent = new NextActionAgent()
    this.talkAgent = new TalkAgent()
    this.moveAgent = new MoveAgent()
  }

  // Main Action: handle possible NPC actions
  runNPC() {
    // Determine next actor
    const { actorId, action } = this.nextActionAgent.run({
      room: this.book.room,
      protocol: this.protocol,
    })
    if (!actorId) return
    if (action === 'talk') {
      // TALK Action
      this.talkAgent
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
      const { targetId, spec, message } = this.moveAgent.run({
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
  }

  // Main Action: check for goals and states
  // nyi
}
