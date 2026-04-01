import Agent from '@/agents/Agent'
import { formatDialog } from '@/helpers/utils'
import TEMPLATES from '@/agents/templates/SavegameSummaryAgent.yaml'

export default class SavegameSummaryAgent extends Agent {
  // Book Agent
  // This agent is writes a summary for a savegame

  // Agent Input
  // - Protocol

  // Agent Output
  // - Summary

  constructor() {
    super()
    this.systemPrompt = TEMPLATES.system
    this.responseFormat = TEMPLATES.format
    this.responseExample = TEMPLATES.example
  }

  // Main Method
  async run({ protocol }) {
    const dialog = formatDialog({
      messages: protocol.filterDialog({ types: 'context' }),
    })
    const prompt = TEMPLATES.user.replace('%dialog%', dialog)
    try {
      const answer = await this.query({ prompt, type: 'text' })
      return answer
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || err.message || 'Unknown error'
      console.log(`SAVEGAMEAGENT ERROR: ${errorMessage}`)
      return ''
    }
  }
}
