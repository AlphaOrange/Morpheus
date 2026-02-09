import ChooserAgent from '@/agents/ChooserAgent'

export default class Narrator {
  // This class handles all AI orchestration
  // Particularly AI talks/actions and all checks and events
  // Narrator does not hold any game data and does not need to be saved with the game

  constructor(book, protocol) {
    this.book = book
    this.protocol = protocol
    this.chooserAgent = new ChooserAgent()
  }

  // Main Action: handle possible NPC actions
  runNPC() {
    // Available NPC actors
    const npcs = this.book.room.presentAiCharacters

    // Stop if there is no NPC here
    if (npcs.length === 0) return

    const actor = this.chooserAgent.run({ npcs: npcs, protocol: this.protocol })
    console.log(actor.name)
  }

  // Main Action: check for goals and states
  // nyi
}
