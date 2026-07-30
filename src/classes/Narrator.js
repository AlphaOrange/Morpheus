import NextActionAgent from '@/agents/NextActionAgent'
import TalkAgent from '@/agents/TalkAgent'
import MoveAgent from '@/agents/MoveAgent'
import SleepAgent from '@/agents/SleepAgent'
import WakeAgent from '@/agents/WakeAgent'
import UpdateCharAgent from '@/agents/UpdateCharAgent'
import StopperAgent from '@/agents/StopperAgent'
import { joinAnd } from '@/helpers/utils'

export default class Narrator {
  // This class handles all AI orchestration
  // Particularly AI talks/actions and all checks and events
  // Narrator does not hold any game data and does not need to be saved with the game

  running = false
  blocked = false
  updateQueue = []

  constructor(book, protocol, options) {
    this.options = options
    this.book = book
    this.protocol = protocol
    this.nextActionAgent = new NextActionAgent()
    this.talkAgent = new TalkAgent()
    this.moveAgent = new MoveAgent()
    this.sleepAgent = new SleepAgent()
    this.wakeAgent = new WakeAgent()
    this.updateCharAgent = new UpdateCharAgent(options)
    this.stopperAgent = new StopperAgent()
  }

  // Handle an agent error
  handleError(title, error, resetRun = true) {
    this.protocol.pushError({
      time: this.book.time,
      text: error,
      title: title,
    })
    // remove the agent's working message
    if (resetRun) {
      this.options.narratorRunning = false
      this.options.narratorRunningMessage = ''
    }
  }

  // TALK Action
  async runTalkAction({ actorId }) {
    this.options.narratorRunningMessage = `${actorId} talking ...`
    const response = await this.talkAgent.run({
      actor: this.book.characters[actorId],
      protocol: this.protocol,
    })

    if (response.error) {
      this.handleError('Error in Talk Agent', response.error)
      return { error: response.error }
    }

    const command = {
      action: 'talk',
      actor: actorId,
      target: response.targetId,
      message: response.message,
    }

    this.options.narratorRunningMessage = ''
    return { command, additionalAction: response.additionalAction }
  }

  // MOVE Action
  async runMoveAction({ actorId }) {
    this.options.narratorRunningMessage = `${actorId} moving ...`
    const response = await this.moveAgent.run({
      actor: this.book.characters[actorId],
      protocol: this.protocol,
    })

    if (response.error) {
      this.handleError('Error in Move Agent', response.error)
      return { error: response.error }
    }
    if (!response.move) return null

    let command
    if (response.company && response.company.length > 0) {
      command = {
        action: 'movewith',
        actor: actorId,
        target: response.targetId,
        spec: response.spec,
        company: response.company,
        message: response.message,
      }
    } else {
      command = {
        action: 'move',
        actor: actorId,
        target: response.targetId,
        spec: response.spec,
        message: response.message,
      }
    }

    this.options.narratorRunningMessage = ''
    return { command }
  }

  // SLEEP Action
  async runSleepAction({ actorId }) {
    this.options.narratorRunningMessage = `${actorId} tiring ...`
    const response = await this.sleepAgent.run({
      actor: this.book.characters[actorId],
      protocol: this.protocol,
    })

    if (response.error) {
      this.handleError('Error in Sleep Agent', response.error)
      return { error: response.error }
    }
    if (!response.sleep) return null

    const command = {
      action: 'sleep',
      actor: actorId,
      seconds: response.duration * 60,
    }

    this.options.narratorRunningMessage = ''
    return { command }
  }

  // WAKE Action
  async runWakeAction({ actorId }) {
    this.options.narratorRunningMessage = `${actorId} waking ...`
    const response = await this.wakeAgent.run({
      actor: this.book.characters[actorId],
      protocol: this.protocol,
    })

    if (response.error) {
      this.handleError('Error in Wake Agent', response.error)
      return { error: response.error }
    }
    if (!response.wake) return null

    const command = {
      action: 'wake',
      actor: actorId,
      target: response.target,
      message: null,
    }

    this.options.narratorRunningMessage = ''
    return { command }
  }

  // Main Action: handle possible NPC actions
  async runNPC({ cycle = 1 }) {
    // store original state to check throughout if run still valid
    const state = { roomId: this.book.roomId }

    // Check first if there even is an NPC present
    if (this.book.room.availableAiCharacters.length === 0) return false

    // Determine next actor
    let { actorId, action } = await this.nextActionAgent.run({
      time: this.book.time,
      room: this.book.room,
      protocol: this.protocol,
      urgentOnly: cycle > 1,
      excludeLastActor: cycle > 1,
    })
    if (!actorId) return false

    // if state changed or narrator blocked: return without action
    if (state.roomId !== this.book.roomId) return false
    if (this.blocked) return false

    if (action === 'talk') {
      let response = await this.runTalkAction({ actorId })
      if (this.blocked) return false
      if (state.roomId !== this.book.roomId) return false
      if (response.error) return false
      this.book.executeCommand(response.command)
      action = response.additionalAction
    }

    // return if state changed or narrator blocked
    if (state.roomId !== this.book.roomId) return false
    if (this.blocked) return false

    // run additional action
    if (action === 'move') {
      let response = await this.runMoveAction({ actorId })
      if (this.blocked) return false
      if (!response || response.error) return false
      this.book.executeCommand(response.command)
    }
    if (action === 'sleep') {
      let response = await this.runSleepAction({ actorId })
      if (this.blocked) return false
      if (!response || response.error) return false
      this.book.executeCommand(response.command)
    }
    if (action === 'wake') {
      let response = await this.runWakeAction({ actorId })
      if (this.blocked) return false
      if (!response || response.error) return false
      this.book.executeCommand(response.command)
    }

    return true
  }

  // Start an NPC action period
  async run({ force = false } = {}) {
    if (this.running) return
    if (this.blocked) return
    if (this.protocol.hasStopper()) return

    if (!force) {
      // check if last action was error
      if (this.protocol.lastMessage.type === 'error') {
        return
      }

      // only run if last action was user
      const playerCharIds = Object.keys(this.book.playerCharacters)
      if (!playerCharIds.includes(this.protocol.recentActor)) {
        return
      }
    }

    this.running = true
    this.options.narratorRunningMessage = ''
    this.options.narratorRunning = true

    // Run NPC cycles
    let again
    for (let cycle = 1; cycle <= this.options.multiActionMaxCycles; cycle++) {
      again = false
      again = await this.runNPC({ cycle })
      if (!again || this.blocked) break
      await new Promise((r) => setTimeout(r, this.options.waitBetweenNpcActions * 1000))
    }

    this.running = false
    this.options.narratorRunning = false
    this.options.narratorRunningMessage = ''
  }

  // Stop current execution and block further running
  stop() {
    this.blocked = true
  }
  // Unblock, narrator will now run as usual again
  unblock() {
    this.blocked = false
  }

  // Main Action: update characters for state changes and goals one at a time
  async update({ char }) {
    this.updateQueue.push(char)
    if (this.updateQueue.length > 1) {
      // Loop already running
      return
    } else {
      while (this.updateQueue.length > 0) {
        const nextChar = this.updateQueue[0]
        let response

        try {
          // Run Update Agent
          response = await this.updateCharAgent.run({
            char: nextChar,
            protocol: this.protocol,
          })
          this.updateQueue.shift()

          if (response.error) {
            this.handleError('Error in UpdateChar Agent', response.error, false)
            break
          }
        } catch {
          break
        }

        // State changes
        for (const stateId of Object.keys(response.stateChanges)) {
          const magnitude = response.stateChanges[stateId].change.toLowerCase()
          let change = 0
          switch (magnitude) {
            case 'major decrease':
              change = nextChar.getState(stateId).change.context[0]
              break
            case 'minor decrease':
              change = nextChar.getState(stateId).change.context[1]
              break
            case 'minor increase':
              change = nextChar.getState(stateId).change.context[2]
              break
            case 'major increase':
              change = nextChar.getState(stateId).change.context[3]
              break
          }
          let prevValue = nextChar.getState(stateId).value
          console.log(
            `${nextChar.id} State Change ${stateId} (${prevValue}): ${change} (${response.stateChanges[stateId].evaluation})`,
          )
          nextChar.getState(stateId).changeValue(change)
        }
        // TODO: insert goal changes here
      }
      this.updateQueue = [] // in case of error we need to empty the queue
    }
  }

  // Start an NPC action period
  async resolveStopper() {
    let stopper = this.protocol.stopper

    // Get AI characters from stopper
    const askerChar = this.book.characters[stopper.from]
    const askedChars = stopper.to.map((charId) => this.book.characters[charId])
    const groupChars = [askerChar, ...askedChars]
    const aiAsked = askedChars.filter((char) => char.controlledBy === 'ai')
    const notGroupChars = Object.values(this.book.room.characters).filter(
      (char) => char.id !== stopper.from && !stopper.to.includes(char.id),
    )

    if (aiAsked.length > 0) {
      // Prepare questions based on stopper subtype
      let question = ''
      if (stopper.subtype === 'move-with') {
        const group = joinAnd(groupChars.map((char) => `${char.name} [${char.id}]`))
        const notGroup = joinAnd(notGroupChars.map((char) => `${char.name} [${char.id}]`))
        const notInvited = notGroup ? ` ${notGroup} are not invited to join.` : ''
        question = `${askerChar.name} [${askerChar.id}] asks for: ${group} all move to ${stopper.payload.spec} ${stopper.payload.target.name} together.${notInvited}`
      } else {
        this.handleError('Error in Stopper Agent', 'Invalid stopper type', false)
      }

      // Run StopperAgent
      let response
      try {
        response = await this.stopperAgent.run({
          protocol: this.protocol,
          question,
          asked: aiAsked,
        })
        if (response.error) {
          this.handleError('Error in Stopper Agent', response.error, false)
          return
        }
      } catch (e) {
        this.handleError('Error in Stopper Agent', e.message, false)
        return
      }

      // Handle decisions
      for (const [charId, reply] of Object.entries(response.replies)) {
        this.protocol.answerStopper(charId, reply === 'accept')
      }
    }
  }
}
