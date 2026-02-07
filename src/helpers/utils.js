import Room from '@/classes/Room'
import Location from '@/classes/Location'
import Destination from '@/classes/Destination'

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

export function formatTime(datetime) {
  const h = String(datetime.getHours()).padStart(2, '0')
  const min = String(datetime.getMinutes()).padStart(2, '0')
  return `${h}:${min}`
}
// ----- Distance Calculation -----

// Calculate distance to target and return as text
function distanceRooms(currentRoom, targetRoom) {
  return 60 // TODO: all of this needs to be (optional) book parameters
}
function distanceLocations(currentLocation, targetLocation) {
  const route = Math.sqrt(
    (currentLocation.position[0] - targetLocation.position[0]) ** 2 +
      (currentLocation.position[1] - targetLocation.position[1]) ** 2,
  )
  const detour = currentLocation.detour + targetLocation.detour
  return (route + detour) * 60
}
function distanceDestinations(currentDestination, targetDestination) {
  const route = Math.sqrt(
    (currentDestination.position[0] - targetDestination.position[0]) ** 2 +
      (currentDestination.position[1] - targetDestination.position[1]) ** 2,
  )
  const detour = currentDestination.detour + targetDestination.detour
  return (route + detour) * 3600
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

// ----- Interprete User Commands -----

const rx = {
  help: /^--([a-z]+)/i,
  move_room: /^(?:([a-z0-9_]+) )?(move room |move to room )([a-z0-9_]+)(?::(.*))?$/i,
  move_location: /^(?:([a-z0-9_]+) )?(move location |move to location )([a-z0-9_]+)(?::(.*))?$/i,
  move_destination:
    /^(?:([a-z0-9_]+) )?(move destination |move to destination )([a-z0-9_]+)(?::(.*))?$/i,
  move_undefined: /^(?:([a-z0-9_]+) )?(move |move to )([a-z0-9_]+)(?::(.*))?$/i,
  move2_room: /^([a-z0-9_]+)? ?(>) ?([a-z0-9_]+)(?::(.*))?$/i,
  move2_location: /^([a-z0-9_]+)? ?(>>) ?([a-z0-9_]+)(?::(.*))?$/i,
  move2_destination: /^([a-z0-9_]+)? ?(>>>) ?([a-z0-9_]+)(?::(.*))?$/i,
  talk1all: /^(?:([a-z0-9_]+) )?(talk|talk to) ?::(.+)$/i, // alice talk to:: text / talk:: text
  talk1: /^(?:([a-z0-9_]+) )?(talk|talk to) ?(?:([a-z0-9_]+))?:(.+)$/i, // alice talk to bob: text / talk to bob: text / talk: / talk to:
  talk2: /^([a-z0-9_]+)? ?(-) ?([a-z0-9_]+):(.+)$/i, // alice-bob: text / -bob: text
  talk3all: /^([a-z0-9_]+)::(.+)$/i, // alice:: text
  talk3: /^([a-z0-9_]+):(.+)$/i, // alice: text
  talk4all: /^:: ?([^:]+)$/i, // :: text
  talk4: /^:? ?([^:]+)$/i, // text / : text
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

// ----- Help Texts -----

import helpData from '@/data/help.yaml'
export function getHelpData(topic) {
  return helpData[topic] || 'No help text available.'
}
