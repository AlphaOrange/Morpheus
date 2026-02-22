import Agent from '@/agents/Agent'
import { formatDialog } from '@/helpers/utils'
import TEMPLATES from '@/agents/templates/MoveAgent.yaml'

export default class MoveAgent extends Agent {
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

  constructor() {
    super()
    this.systemPrompt = TEMPLATES.system
    this.responseFormat = TEMPLATES.format
    this.responseExample = TEMPLATES.example
  }

  // Build text block: description of You
  you_profile(actor) {
    return `${actor.name}, ${actor.profession} (${actor.gender}, ${actor.age})
${actor.background}, ${actor.wants}
${actor.body}, ${actor.clothing}, ${actor.appearance}
Attributes: ${actor.mind}`
  }

  // Build text block: descriptions of Others
  others_profiles({ actor, room }) {
    return Object.values(room.characters)
      .filter((char) => char.id != actor.id)
      .map(
        (char) => `${char.name}, ${char.profession} (ID: ${char.id})
${char.body}, ${char.clothing}, ${char.appearance}`,
      )
      .join('\n\n')
  }

  // Main Method
  async run({ actor, room, protocol }) {
    const dialog = formatDialog({
      messages: protocol.filterDialog({ types: 'context', present: actor }),
      perspective: actor.id,
    })
    const you_profile = this.you_profile(actor)
    const others_profiles = this.others_profiles({ actor: actor, room: room })
    const place_description = room.describeMoveOptions()
    const prompt = TEMPLATES.user
      .replace('%dialog%', dialog)
      .replaceAll('%you%', actor.name)
      .replace('%you_profile%', you_profile)
      .replace('%others_profiles%', others_profiles)
      .replace('%place_description%', place_description)
      .replace('%room%', room.name)
    const answer = await this.query(prompt)
    if ('error' in answer) {
      return answer
    } else {
      return {
        move: answer.move,
        targetId: answer.destination,
        spec: answer.type,
      }
    }
  }
}
