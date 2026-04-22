import Agent from '@/agents/Agent'
import { formatDialog } from '@/helpers/utils'
import TEMPLATES from '@/agents/templates/WakeAgent.yaml'

export default class WakeAgent extends Agent {
  // NPC Agent
  // This agent is performing a WAKE action

  // Agent Input
  // - Actor (Character)
  // - Protocol

  // Agent Output
  // - wake: true/false (perform wake action)
  // - target: Character.id

  LOOKBACK = 20

  constructor() {
    super()
    this.systemPrompt = TEMPLATES.system
    this.responseFormat = TEMPLATES.format
    this.responseExamples = TEMPLATES.examples
  }

  // Build text block: descriptions of Others
  sleepers_profiles({ sleepers }) {
    return sleepers.map((char) => char.externalDescription).join('\n\n')
  }

  // Main Method
  async run({ actor, protocol }) {
    const room = actor.room
    const sleepers = room.busyCharacters.filter((char) => char.action.type === 'sleep')
    if (sleepers.length === 0) {
      return {
        sleep: false,
        target: null,
      }
    }
    const dialog = formatDialog({
      messages: protocol.filterDialog({
        types: 'context',
        present: actor,
        lookback: this.LOOKBACK,
      }),
      perspective: actor.id,
    })
    const you_profile = actor.selfDescription
    const sleepers_profiles = this.sleepers_profiles({ sleepers })
    const prompt = TEMPLATES.user
      .replace('%dialog%', dialog)
      .replaceAll('%you%', actor.name)
      .replace('%you_profile%', you_profile)
      .replace('%sleepers_profiles%', sleepers_profiles)
      .replace('%room%', room.name)

    try {
      const answer = await this.query({ prompt, type: 'json' })
      return {
        wake: answer.wake,
        target: answer.character,
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || err.message || 'Unknown error'
      console.log(`WAKEAGENT ERROR: ${errorMessage}`)
      return { error: `Wake Agent Error: ${errorMessage}` }
    }
  }
}
