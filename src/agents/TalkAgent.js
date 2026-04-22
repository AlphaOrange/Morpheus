import Agent from '@/agents/Agent'
import { formatDialog, joinOr } from '@/helpers/utils'
import TEMPLATES from '@/agents/templates/TalkAgent.yaml'

export default class TalkAgent extends Agent {
  // NPC Agent
  // This agent is performing a TALK action

  // Agent Input
  // - Actor (Character)
  // - Protocol

  // Agent Output
  // - text: Message
  // - to: Target (:all or Character.id)

  constructor() {
    super()
    this.systemPrompt = TEMPLATES.system
    this.responseFormat = TEMPLATES.format
    this.responseExample = TEMPLATES.example
  }

  // Build text block: descriptions of Others
  others_profiles({ actor }) {
    return Object.values(actor.room.characters)
      .filter((char) => char.id != actor.id)
      .map((char) => char.externalDescription)
      .join('\n\n')
  }

  additional_actions({ room }) {
    const actions = [{ type: 'MOVE', description: 'move to another room or a different location' }]
    if (room.hasAction('sleep')) {
      actions.push({ type: 'SLEEP', description: 'go to sleep' })
    }
    if (room.busyCharacters.filter((char) => char.action.type === 'sleep').length > 0) {
      actions.push({ type: 'WAKE', description: 'wake someone up from sleeping' })
    }
    actions.push({ type: 'NONE', description: 'no additional action' })
    return actions
  }

  // Main Method
  async run({ actor, protocol }) {
    const dialog = formatDialog({
      messages: protocol.filterDialog({ types: 'context', present: actor }),
      perspective: actor.id,
    })
    const you_profile = actor.selfDescription
    const others_profiles = this.others_profiles({ actor })
    const actions = this.additional_actions({ room: actor.room })
    const additional_actions_list = actions
      .map((action) => `- ${action.type}: ${action.description}`)
      .join('\n')
    const prompt = TEMPLATES.user
      .replaceAll('%you%', actor.name)
      .replace('%dialog%', dialog)
      .replace('%others_profiles%', others_profiles)
      .replace('%you_profile%', you_profile)
      .replace('%additional_actions_list%', additional_actions_list)

    try {
      const answer = await this.query({ prompt, type: 'json' })
      // FOR TESTING PURPOSES:
      // const answer = { text: 'Test', to: 'alice' }
      return {
        message: answer.text,
        targetId: answer.to === 'all' ? ':all' : answer.to, // ai often gets this wrong
        additionalAction: answer.action?.toLowerCase(),
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || err.message || 'Unknown error'
      console.log(`TALKAGENT ERROR: ${errorMessage}`)
      return { error: `Talk Agent Error: ${errorMessage}` }
    }
  }
}
