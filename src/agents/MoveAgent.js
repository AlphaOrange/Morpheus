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
    return `${actor.name} (${actor.gender}, ${actor.age}, ${actor.profession})
${actor.background}
${actor.body}, ${actor.clothing}, ${actor.appearance}
Behavioral instructions: ${actor.behavior}`
  }

  // Build text block: descriptions of Others
  others_profiles({ actor }) {
    return Object.values(actor.room.characters)
      .filter((char) => char.id != actor.id)
      .map(
        (char) => `${char.name} (ID: ${char.id}), ${char.profession}
${char.body}, ${char.clothing}, ${char.appearance}`,
      )
      .join('\n\n')
  }

  // Main Method
  async run({ actor, protocol }) {
    const dialog = formatDialog({
      messages: protocol.filterDialog({ types: 'context', present: actor }),
      perspective: actor.id,
    })
    const room = actor.room
    const you_profile = this.you_profile(actor)
    const others_profiles = this.others_profiles({ actor: actor })
    const place_description = room.describeMoveOptions()
    const prompt = TEMPLATES.user
      .replace('%dialog%', dialog)
      .replaceAll('%you%', actor.name)
      .replace('%you_profile%', you_profile)
      .replace('%others_profiles%', others_profiles)
      .replace('%place_description%', place_description)
      .replace('%room%', room.name)

    try {
      const answer = await this.query({ prompt, type: 'json' })
      // FOR TESTING PURPOSES:
      // const answer = { text: 'Test', to: 'alice' }
      return {
        move: answer.move,
        targetId: answer.destination,
        spec: answer.type,
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || err.message || 'Unknown error'
      console.log(`MOVEAGENT ERROR: ${errorMessage}`)
      return { error: `Move Agent Error: ${errorMessage}` }
    }
  }
}
