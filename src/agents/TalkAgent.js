import Agent from '@/agents/Agent'
import { formatDialog } from '@/helpers/utils'
import TEMPLATES from '@/agents/templates/TalkAgent.yaml'

export default class TalkAgent extends Agent {
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

  constructor() {
    super()
    this.systemPrompt = TEMPLATES.system
  }

  async run({ actor, room, protocol }) {
    const dialog = formatDialog(protocol.filterDialog({ types: 'context', present: actor }))
    const others_profiles = Object.values(room.characters)
      .filter((char) => char.id != actor.id)
      .map(
        (char) => `${char.name}, ${char.profession} (ID: ${char.id})
${char.body}, ${char.clothing}, ${char.appearance}`,
      )
      .join('\n\n')
    const you_profile = `${actor.name}, ${actor.profession} (${actor.gender}, ${actor.age})
${actor.background}, ${actor.wants}
${actor.body}, ${actor.clothing}, ${actor.appearance}
Attributes: ${actor.mind}`
    const prompt = TEMPLATES.user
      .replaceAll('%you%', actor.name)
      .replace('%dialog%', dialog)
      .replace('%others_profiles%', others_profiles)
      .replace('%you_profile%', you_profile)
    const answer = await this.query(prompt)
    return {
      message: answer.text,
      targetId: answer.to === 'all' ? ':all' : answer.to, // ai usually gets this wrong
    }
  }
}
