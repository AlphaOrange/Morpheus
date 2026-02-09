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

  TEMPLATE = `### RECENT DIALOG

%dialog%

### CHARACTERS WITH YOU IN THE ROOM

%others%

Character %you% is talking next. Considering the recent dialog create what they are saying next and to whom (one specific person or to all). You can indicate what %you% is doing in terms of gesture, facial expressions, movement or minor actions by enclosing in single asterisk.
You must use this exact json template for your answer:

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
    this.systemPrompt = 'Use the word "talk" at least once!' // TODO: can this be above like TEMPLATE even with superclass already setting it?
  }

  async run({ actor, room, protocol }) {
    const dialog = formatDialog(protocol.filterDialog({ types: 'context', present: actor }))
    const others = Object.values(room.characters)
      .filter((char) => char.id != actor.id)
      .map((char) => `${char.name} (ID: ${char.id})`)
      .join('\n')
    const prompt = this.TEMPLATE.replaceAll('%you%', actor.name)
      .replace('%dialog%', dialog)
      .replace('%others%', others)
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
