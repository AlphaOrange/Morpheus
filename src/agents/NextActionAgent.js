export default class NextAgent {
  // NPC Agent
  // This agent is for choosing which character acts next and what the action is
  // Currently it does not use any AI

  // Agent Input
  // - Room
  // - Protocol

  // Agent Output
  // - NPC Character ID
  // - NPC Next Action ("talk", "move")

  // Run Action: evaluate and return the next npc to act
  run({ room, protocol }) {
    const npcs = room.presentAiCharacters
    if (npcs.length === 0) {
      return null
    } else {
      return {
        actorId: npcs[0].id,
        action: 'talk',
      }
    }
  }
}
