import Agent from '@/agents/Agent'
import { formatDialog, joinAnd } from '@/helpers/utils'
import { useBookStore } from '@/stores/book'
import TEMPLATES from '@/agents/templates/StopperAgent.yaml'

export default class StopperAgent extends Agent {
  // NPC Agent
  // This agent is making decisions on stoppers

  // Agent Input
  // - Protocol
  // - Question asked
  // - LIst of asked characters

  // Agent Output
  // - replies: Dictionary of character id's replies ("accept" or "decline")

  book = useBookStore()
  LOOKBACK = 20

  constructor() {
    super()
    this.systemPrompt = TEMPLATES.system
    this.responseFormat = TEMPLATES.format
    this.responseExamples = TEMPLATES.examples
  }

  // Build text block: descriptions of Others
  profiles({ chars }) {
    return chars.map((char) => char.neutralDescription).join('\n\n')
  }

  // Main Method
  async run({ protocol, question, asked }) {
    const dialog = formatDialog({
      messages: protocol.filterDialog({
        types: 'context',
        lookback: this.LOOKBACK,
        scene: -1,
      }),
    })
    const profiles = this.profiles({ chars: asked })
    const charsAsked = joinAnd(asked.map((char) => `${char.name} [ID: ${char.id}]`))
    const prompt = TEMPLATES.user
      .replace('%dialog%', dialog)
      .replace('%profiles%', profiles)
      .replace('%question%', question)
      .replace('%asked%', charsAsked)

    try {
      const answer = await this.query({ prompt, type: 'json' })
      return { replies: answer.replies }
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || err.message || 'Unknown error'
      console.log(`STOPPERAGENT ERROR: ${errorMessage}`)
      return { error: `Stopper Agent Error: ${errorMessage}` }
    }
  }
}
