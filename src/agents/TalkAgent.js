export default class TalkAgent {
  // NPC Agent
  // This agent is performing a TALK action
  // Currently it does not use any AI

  // Agent Input
  // - Actor (Character)
  // - Room
  // - Protocol

  // Agent Output
  // - Target (:all or Character.id)
  // - Message

  run({ actor, room, protocol }) {
    const others = Object.values(room.characters).filter((char) => char.id != actor.id)
    return {
      message: 'Hello Human!',
      targetId: ':all',
    }
  }
}
