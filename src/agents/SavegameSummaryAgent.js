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
    const answer = await this.query(prompt)
    if ('error' in answer) {
      return ''
    } else {
      return answer.summary
    }
  }
}
