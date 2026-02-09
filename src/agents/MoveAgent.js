export default class MoveAgent {
  // NPC Agent
  // This agent is performing a MOVE action
  // Currently it does not use any AI

  // Agent Input
  // - Actor (Character)
  // - Room
  // - Protocol

  // Agent Output
  // - Target (ID of a room/location/destination)
  // - Spec ("destination", "location" or "room")
  // - Message (optional, can be null)

  run({ actor, room, protocol }) {
    return {
      targetId: 'room2',
      spec: 'room',
      message: null,
    }
  }
}
