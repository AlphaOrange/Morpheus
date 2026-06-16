import Agent from '@/agents/Agent'
// import { formatDialog } from '@/helpers/utils'
// import TEMPLATES from '@/agents/templates/SleepAgent.yaml'

export default class SleepAgent extends Agent {
  // NPC Agent
  // This agent is performing a SLEEP action
  // Currently not using any AI

  // Agent Input
  // - Actor (Character)
  // - Protocol

  // Agent Output
  // - sleep: true/false (perform sleep action)
  // - duration: number of minutes to sleep

  constructor() {
    super()
    // this.systemPrompt = TEMPLATES.system
    // this.responseFormat = TEMPLATES.format
    // this.responseExamples = TEMPLATES.examples
  }

  // Main Method
  async run({ actor, protocol }) {
    // check if sleep is possible in room
    if (!actor.room.hasAction('sleep')) {
      return {
        sleep: false,
        duration: 0,
      }
    }
    let duration = actor.suggestSleepingMinutes()
    if (duration === 0) {
      duration = this.options.defaultSleepDuration
    } else {
      duration = Math.max(this.options.minSleepDuration, duration)
    }
    return {
      sleep: true,
      duration: duration,
    }
  }
}
