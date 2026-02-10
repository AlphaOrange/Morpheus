import Agent from '@/agents/Agent'
import { formatDialog } from '@/helpers/utils'

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

  TEMPLATE = `### RECENT DIALOG ###

%dialog%

### THIS IS YOU ###

You are now %you%.

%you_profile%

### CHARACTERS WITH YOU IN THE ROOM ###

%others_profiles%

You, %you%, are talking next. Considering the recent dialog create what you are saying next and to whom (one specific person or to all). You can indicate what you are doing in terms of gesture, facial expressions, movement or minor actions by enclosing in single asterisk.
You must exclusively use this exact json template for your answer and nothing else:

{
  "to": [id of person spoken to or ':all'],
  "text": [what the person is saying]
}

### EXAMPLE OUTPUT

{
  "to": "nina",
  "text": "*Looking at Nina curiously* Hey! Haven't I seen you on the conference today? Third row, red shirt, right? *smiling*"
}

`

  constructor() {
    super()
    this.systemPrompt =
      'You are an expert screenwriter and improv actor who slips into a specific role for continuing a dialogue.' // TODO: can this be above like TEMPLATE even with superclass already setting it?
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
    const prompt = this.TEMPLATE.replaceAll('%you%', actor.name)
      .replace('%dialog%', dialog)
      .replace('%others_profiles%', others_profiles)
      .replace('%you_profile%', you_profile)
    console.log(prompt)
    const answer = await this.query(prompt)
    if (!answer) {
      return null
    }
    const values = JSON.parse(answer)
    return {
      message: values.text,
      targetId: values.to,
    }
  }
}
