import Room from '@/classes/Room'
import Location from '@/classes/Location'
import Destination from '@/classes/Destination'
import { useOptionsStore } from '@/stores/options'
import { useBookStore } from '@/stores/book'
import semver from 'semver'

// ----- General Helpers -----

export function truncateString(str, num) {
  if (str.length > num) {
    return str.slice(0, num) + ' ...'
  } else {
    return str
  }
}

export function formatDate(datetime) {
  const d = datetime.getDate()
  const m = datetime.getMonth() + 1
  const y = datetime.getFullYear()
  return `${d}. ${m}. ${y}`
}

export function formatTime({ datetime, ampm = false }) {
  const h = String(datetime.getHours()).padStart(2, '0')
  const min = String(datetime.getMinutes()).padStart(2, '0')
  if (ampm) {
    const suffix = datetime.getHours() >= 12 ? 'pm' : 'am'
    return `${h}:${min}${suffix}`
  } else {
    return `${h}:${min}`
  }
}

export function clamp(number, min, max) {
  return Math.max(min, Math.min(number, max))
}

// return a key from object using keys as relative probabilities
export function sampleKey(obj) {
  const entries = Object.entries(obj)
  if (entries.length === 1) {
    return Object.keys(obj)[0]
  }
  const total = entries.reduce((sum, [, val]) => sum + val, 0)
  if (total === 0) {
    const keys = entries.map(([k]) => k)
    return keys[Math.floor(Math.random() * keys.length)]
  }
  let rand = Math.random() * total
  for (const [key, val] of entries) {
    if (rand < val) return key
    rand -= val
  }
}

// ----- Distance Calculation -----

// Calculate distance to target and return as text
function distanceRooms(currentRoom, targetRoom) {
  const options = useOptionsStore()
  return Math.round(options.moveDurationRoom)
}
function distanceLocations(currentLocation, targetLocation) {
  const options = useOptionsStore()
  const route = Math.sqrt(
    (currentLocation.position[0] - targetLocation.position[0]) ** 2 +
      (currentLocation.position[1] - targetLocation.position[1]) ** 2,
  )
  const detour = currentLocation.detour + targetLocation.detour
  return Math.round((route + detour) * options.moveDurationLocation)
}
function distanceDestinations(currentDestination, targetDestination) {
  const options = useOptionsStore()
  const route = Math.sqrt(
    (currentDestination.position[0] - targetDestination.position[0]) ** 2 +
      (currentDestination.position[1] - targetDestination.position[1]) ** 2,
  )
  const detour = currentDestination.detour + targetDestination.detour
  return Math.round((route + detour) * options.moveDurationDestination)
}
export function distancePeriod(currentRoom, target) {
  if (target instanceof Room) {
    return distanceRooms(currentRoom, target)
  } else if (target instanceof Location) {
    return distanceLocations(currentRoom.location, target)
  } else if (target instanceof Destination) {
    return distanceDestinations(currentRoom.location.destination, target)
  }
}

export function periodText(period) {
  if (period < 60) {
    return `${period}s`
  } else if (period < 60 * 60) {
    const roundedMins = Math.round(period / 60)
    return `${roundedMins}m`
  } else if (period < 60 * 60 * 24) {
    const roundedHours = Math.round(period / 60 / 60)
    return `${roundedHours}h`
  } else {
    const roundedDays = Math.round(period / 60 / 60 / 24)
    return `${roundedDays}d`
  }
}
export function distancePeriodText(currentRoom, target) {
  const distance = distancePeriod(currentRoom, target)
  return periodText(distance)
}

// ----- Interpret User Commands -----

const rx = {
  help: /^--([a-z]+)/i,
  set_option: /^set option ([a-z]+) ?= ?([a-z0-9_\\-]+)/i,
  switch1: /^switch ([0-9]+)$/i, // switch 3 (third room in the room row)
  switch2: /^switch ([a-z0-9_]+)$/i, // switch taproom
  switch3: /^switch$/i, // switch (next room in the room row)
  wait: /^wait ([0-9]+)$/i, // wait x minutes (max 60)
  sleep: /^(?:([a-z0-9_]+) )?sleep ([0-9]+)$/i, // sleep x minutes (max 720)
  wake: /^(?:([a-z0-9_]+) )?wake ([a-z0-9_]+)(?::(.*))?$/is, // alice wake bob: Wake up!
  talk_colons: /^((?:[^:]+ ){6}.*)$/is, // after 6 spaces without colon, this is just a talk message and user may use colons
  move_room: /^(?:([a-z0-9_]+) )?(move room |move to room )([a-z0-9_]+)(?::(.*))?$/is,
  move_location: /^(?:([a-z0-9_]+) )?(move location |move to location )([a-z0-9_]+)(?::(.*))?$/is,
  move_destination:
    /^(?:([a-z0-9_]+) )?(move destination |move to destination )([a-z0-9_]+)(?::(.*))?$/is,
  move_undefined: /^(?:([a-z0-9_]+) )?(move |move to )([a-z0-9_]+)(?::(.*))?$/is,
  move2_room: /^([a-z0-9_]+)? ?(>) ?([a-z0-9_]+)(?::(.*))?$/is,
  move2_location: /^([a-z0-9_]+)? ?(>>) ?([a-z0-9_]+)(?::(.*))?$/is,
  move2_destination: /^([a-z0-9_]+)? ?(>>>) ?([a-z0-9_]+)(?::(.*))?$/is,
  talk1all: /^(?:([a-z0-9_]+) )?(talk|talk to) ?::(.+)$/is, // alice talk to:: text / talk:: text
  talk1: /^(?:([a-z0-9_]+) )?(talk|talk to) ?(?:([a-z0-9_]+))?:(.+)$/is, // alice talk to bob: text / talk to bob: text / talk: / talk to:
  talk2: /^([a-z0-9_]+)? ?(-) ?([a-z0-9_]+):(.+)$/is, // alice-bob: text / -bob: text
  talk3all: /^([a-z0-9_]+)::(.+)$/is, // alice:: text
  talk3: /^([a-z0-9_]+):(.+)$/is, // alice: text
  talk4all: /^:: ?(.+)$/is, // :: text
  talk4: /^:? ?(.+)$/is, // text / : text
}

export function messageToCommand(message) {
  let res
  let command = null

  // Help commands
  res = rx.help.exec(message)
  if (res) {
    command = { action: 'help', topic: res[1].toLowerCase() }
    return command
  }

  // Set options
  res = rx.set_option.exec(message)
  if (res) {
    command = { action: 'setOption', option: res[1], value: res[2] }
    return command
  }

  // Switch to another room
  res = rx.switch1.exec(message)
  if (res) {
    command = { action: 'switch', roomNumber: Number(res[1]) }
    return command
  }
  res = rx.switch2.exec(message)
  if (res) {
    command = { action: 'switch', roomId: res[1].trim() }
    return command
  }
  res = rx.switch3.exec(message)
  if (res) {
    command = { action: 'switch' }
    return command
  }

  // Wait for x minutes (max 60)
  res = rx.wait.exec(message)
  if (res) {
    const waitSeconds = Math.min(res[1], 60) * 60
    command = { action: 'wait', seconds: waitSeconds }
    return command
  }

  // Sleep for x minutes (max 720)
  res = rx.sleep.exec(message)
  if (res) {
    const actor = res[1] || ':group'
    const sleepSeconds = Math.min(res[2], 720) * 60
    command = { action: 'sleep', actor: actor, seconds: sleepSeconds }
    return command
  }
  // Wake someone up
  res = rx.wake.exec(message)
  if (res) {
    let msg = res[3] ? res[3].trim() : null
    command = {
      action: 'wake',
      actor: res[1] || ':active',
      target: res[2].toLowerCase(),
      message: msg,
    }
    return command
  }

  // Talk: Message only (with possible colons)
  res = rx.talk_colons.exec(message)
  if (res) {
    command = { action: 'talk', actor: ':active', target: ':resume', message: res[1].trim() }
    return command
  }

  // Move to room
  res = rx.move_room.exec(message) || rx.move2_room.exec(message)
  if (res) {
    let actor = res[1] || ':group'
    let msg = res[4] ? res[4].trim() : null
    command = {
      action: 'move',
      actor: actor.toLowerCase(),
      target: res[3].toLowerCase(),
      spec: 'room',
      message: msg,
    }
    return command
  }

  // Move to location
  res = rx.move_location.exec(message) || rx.move2_location.exec(message)
  if (res) {
    let actor = res[1] || ':group'
    let msg = res[4] ? res[4].trim() : null
    command = {
      action: 'move',
      actor: actor.toLowerCase(),
      target: res[3].toLowerCase(),
      spec: 'location',
      message: msg,
    }
    return command
  }

  // Move to destination
  res = rx.move_destination.exec(message) || rx.move2_destination.exec(message)
  if (res) {
    let actor = res[1] || ':group'
    let msg = res[4] ? res[4].trim() : null
    command = {
      action: 'move',
      actor: actor.toLowerCase(),
      target: res[3].toLowerCase(),
      spec: 'destination',
      message: msg,
    }
    return command
  }

  // Move to undefined
  res = rx.move_undefined.exec(message)
  if (res) {
    let actor = res[1] || ':group'
    let msg = res[4] ? res[4].trim() : null
    command = {
      action: 'move',
      actor: actor.toLowerCase(),
      target: res[3].toLowerCase(),
      spec: ':undefined',
      message: msg,
    }
    return command
  }

  // Talk to :all
  res = rx.talk1all.exec(message)
  if (res) {
    command = {
      action: 'talk',
      actor: res[1].toLowerCase(),
      target: ':all',
      message: res[3].trim(),
    }
    return command
  }
  res = rx.talk3all.exec(message)
  if (res) {
    command = {
      action: 'talk',
      actor: res[1].toLowerCase(),
      target: ':all',
      message: res[2].trim(),
    }
    return command
  }
  res = rx.talk4all.exec(message)
  if (res) {
    command = { action: 'talk', actor: ':active', target: ':all', message: res[1].trim() }
    return command
  }

  // Talk
  res = rx.talk1.exec(message) || rx.talk2.exec(message)
  if (res) {
    let actor = res[1] || ':active'
    let target = res[3] || ':resume'
    command = {
      action: 'talk',
      actor: actor.toLowerCase(),
      target: target.toLowerCase(),
      message: res[4].trim(),
    }
    return command
  }

  // Resume Talk
  res = rx.talk3.exec(message)
  if (res) {
    command = {
      action: 'talk',
      actor: res[1].toLowerCase(),
      target: ':resume',
      message: res[2].trim(),
    }
    return command
  }

  // Talk: Message only
  res = rx.talk4.exec(message)
  if (res) {
    command = { action: 'talk', actor: ':active', target: ':resume', message: res[1].trim() }
    return command
  }

  return { action: 'error', message: 'Invalid Command' }
}

// ----- Formatting -----

// format dialog string for ai prompting
export function formatDialog({ messages, perspective }) {
  const book = useBookStore()
  const options = useOptionsStore()
  let dialog = []
  let scene = -1
  let time = -1
  for (let message of messages) {
    if (message.scene !== scene) {
      scene = message.scene
      time = message.time
      const roomName = book.rooms[message.room].name
      const gameTime = formatTime({ datetime: book.toGametime(message.time), ampm: true })
      dialog.push(`(Place: ${roomName} | Time: ${gameTime})`)
    }
    if (message.time - time >= options.repeatTimestampAfterSeconds) {
      time = message.time
      const gameTime = formatTime({ datetime: book.toGametime(message.time), ampm: true })
      dialog.push(`(Time: ${gameTime})`)
    }
    if (message.type === 'talk') {
      let fromName = book.characters[message.from].name
      let fromId = message.from
      if (message.to === ':all') {
        dialog.push(`${fromName} [${fromId}]: "${message.text}"`)
      } else {
        let toName = book.characters[message.to].name
        let toId = message.to
        dialog.push(`${fromName} [${fromId}] to ${toName} [${toId}]: "${message.text}"`)
      }
    } else if (message.type === 'hint' && [perspective, ':all'].includes(message.to)) {
      dialog.push(`(Hint: ${message.text})`)
    }
  }
  return dialog.join('\n')
}

export function joinOr(parts) {
  parts = parts.slice()
  if (parts.length === 1) return parts
  const lastPart = parts.pop()
  return parts.join(', ') + ' or ' + lastPart
}

export function joinAnd(parts) {
  parts = parts.slice()
  if (parts.length === 1) return parts
  const lastPart = parts.pop()
  return parts.join(', ') + ' and ' + lastPart
}

// ----- Image Helpers -----

export function genericImg({ filename, size }) {
  return `/images/${size}/${filename}`
}
export function bookImg({ filename, size, bookId = null }) {
  if (!bookId) {
    const book = useBookStore()
    bookId = book.id
  }
  return `/books/${bookId}/${size}/${filename}`
}

// ----- Help Texts -----

import helpData from '@/data/help.yaml'
export function getHelpData(topic) {
  const fallback = {
    title: `Searching for '${topic}' ...`,
    text: 'No help text available.',
  }
  return helpData[topic] || fallback
}

// ----- Version + Compatibility Info -----

import versionData from '@/data/versions.yaml'
export function checkSupported(version) {
  const info = versionData.versions[0]
  if (semver.satisfies(version, '>=' + info.fullSupport)) {
    return 'full'
  } else if (semver.satisfies(version, '>=' + info.minSupport)) {
    return 'min'
  } else {
    return 'unsupported'
  }
}
export const features = versionData.features
export const changelog = versionData.versions
  .map((v) => `### Version: ${v.version}\n\n${v.updates}`)
  .join('\n\n')
