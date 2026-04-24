import Agent from '@/agents/Agent'
import { formatDialog } from '@/helpers/utils'
import TEMPLATES from '@/agents/templates/UpdateCharAgent.yaml'

export default class TalkAgent extends Agent {
  // Update Character Agent
  // This agent is checking characters for progress in states and goals

  // Agent Input
  // - char
  // - protocol

  // Agent Output
  // - stateChanges: list of state changes
  // - goalsAchieved: list of achieved goals

  constructor(options) {
    super()
    this.systemPrompt = TEMPLATES.system
    this.responseFormat = TEMPLATES.format
    this.responseExample = TEMPLATES.example
    this.options = options
  }

  // Build text block: descriptions of Others
  others_profiles({ actor }) {
    return Object.values(actor.room.characters)
      .filter((char) => char.id != actor.id)
      .map((char) => char.externalDescription)
      .join('\n\n')
  }

  states_descriptions({ char }) {
    return Object.values(char.states)
      .map(
        (state) => `"${state.id}"
${state.description}, examples for change causes:
MAJOR DECREASE: ${state.examples.major_decrease}
MINOR DECREASE: ${state.examples.minor_decrease}
MINOR INCREASE: ${state.examples.minor_increase}
MAJOR INCREASE: ${state.examples.major_increase}
`,
      )
      .join('\n\n')
  }

  // Main Method
  async run({ char, protocol }) {
    // Check if character needs update
    const updateDialog = protocol.filterDialog({
      types: 'context',
      present: char,
      since: { type: 'id', threshold: char.lastUpdate + 1 },
    })
    if (updateDialog.length < this.options.actionsUntilUpdateAgent) {
      return {
        stateChanges: [],
        goalsAchieved: [],
      }
    }

    // Check if there are even states
    if (Object.keys(char.states).length === 0) {
      char.lastUpdate = updateDialog.slice(-1)[0].id
      return {
        stateChanges: [],
        goalsAchieved: [],
      }
    }

    try {
      const dialog = formatDialog({
        messages: updateDialog,
        perspective: char.id,
      })
      const you_profile = char.neutralDescription
      const others_profiles = this.others_profiles({ actor: char })
      const states_descriptions = this.states_descriptions({ char })
      const prompt = TEMPLATES.user
        .replaceAll('%you%', char.name)
        .replace('%dialog%', dialog)
        .replace('%others_profiles%', others_profiles)
        .replace('%you_profile%', you_profile)
        .replace('%states_descriptions%', states_descriptions)
      const answer = await this.query({ prompt, type: 'json' })
      char.lastUpdate = updateDialog.slice(-1)[0].id
      return {
        stateChanges: answer.condition_changes,
        goalsAchieved: [],
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || err.message || 'Unknown error'
      console.log(`UPDATE CHAR ERROR: ${errorMessage}`)
      return { error: `Update Char Agent Error: ${errorMessage}` }
    }
  }
}
