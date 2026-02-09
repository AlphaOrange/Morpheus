export default class NextAgent {
  // NPC Agent
  // This agent is for choosing which character acts next and what the action is
  // Currently it does not use any AI

  // Agent Input
  // - Actor (Character)
  // - Room
  // - Protocol

  // Agent Output
  // - Target (:all or Character.id)
  // - Message

  // Run Action: evaluate and return the next npc to act
  run({ actor, room, protocol }) {
    const others = Object.values(room.characters).filter((char) => char.id != actor.id)
    return {
      message: 'Hello Human!',
      targetId: ':all',
    }
  }
}
