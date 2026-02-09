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
    const { actorId, action } = this.nextActionAgent.run({
      room: this.book.room,
      protocol: this.protocol,
    })
    if (actorId) {
      if (action === 'talk') {
        const { message, targetId } = this.talkAgent.run({
          actor: this.book.characters[actorId],
          room: this.book.room,
          protocol: this.protocol,
        })
        this.book.executeCommand({
          action: 'talk',
          actor: actorId,
          target: targetId,
          message: message,
        })
      } else if (action === 'move') {
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
  }

  // Main Action: check for goals and states
  // nyi
}
