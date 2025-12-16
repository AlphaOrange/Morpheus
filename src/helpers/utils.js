import Room from '@/classes/Room'
import Location from '@/classes/Location'
import Destination from '@/classes/Destination'

export function truncateString(str, num) {
  if (str.length > num) {
    return str.slice(0, num) + ' ...'
  } else {
    return str
  }
}

// Calculate distance to target and return as text
function distanceRooms(currentRoom, targetRoom) {
  return 60
}
function distanceLocations(currentLocation, targetLocation) {
  return (
    Math.sqrt(
      (currentLocation.position[0] - targetLocation.position[0]) ** 2 +
        (currentLocation.position[1] - targetLocation.position[1]) ** 2,
    ) * 60
  )
}
function distanceDestinations(currentDestination, targetDestination) {
  return (
    Math.sqrt(
      (currentDestination.position[0] - targetDestination.position[0]) ** 2 +
        (currentDestination.position[1] - targetDestination.position[1]) ** 2,
    ) * 3600
  )
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
  move_room: /^(?:([a-z0-9_]+) )?(move room |move to room )([a-z0-9_]+)(?::(.*))?$/,
  move_location: /^(?:([a-z0-9_]+) )?(move location |move to location )([a-z0-9_]+)(?::(.*))?$/,
  move_destination:
    /^(?:([a-z0-9_]+) )?(move destination |move to destination )([a-z0-9_]+)(?::(.*))?$/,
  move_undefined: /^(?:([a-z0-9_]+) )?(move |move to )([a-z0-9_]+)(?::(.*))?$/,
  move2_room: /^([a-z0-9_]+)? ?(>) ?([a-z0-9_]+)(?::(.*))?$/,
  move2_location: /^([a-z0-9_]+)? ?(>>) ?([a-z0-9_]+)(?::(.*))?$/,
  move2_destination: /^([a-z0-9_]+)? ?(>>>) ?([a-z0-9_]+)(?::(.*))?$/,
  talk1all: /^(?:([a-z0-9_]+) )?(talk|talk to) ?::(.+)$/, // alice talk to:: text / talk:: text
  talk1: /^(?:([a-z0-9_]+) )?(talk|talk to) ?(?:([a-z0-9_]+))?:(.+)$/, // alice talk to bob: text / talk to bob: text / talk: / talk to:
  talk2: /^([a-z0-9_]+)? ?(-) ?([a-z0-9_]+):(.+)$/, // alice-bob: text / -bob: text
  talk3all: /^([a-z0-9_]+)::(.+)$/, // alice:: text
  talk3: /^([a-z0-9_]+):(.+)$/, // alice: text
  talk4all: /^:: ?([^:]+)$/, // :: text
  talk4: /^:? ?([^:]+)$/, // text / : text
}

export function messageToCommand(message) {
  let res
  let command = null

  // Move to room
  res = rx.move_room.exec(message) || rx.move2_room.exec(message)
  if (res) {
    let actor = res[1] || ':group'
    let msg = res[4] ? res[4].trim() : null
    command = { action: 'move', actor: actor, target: res[3], spec: 'room', message: msg }
    return command
  }

  // Move to location
  res = rx.move_location.exec(message) || rx.move2_location.exec(message)
  if (res) {
    let actor = res[1] || ':group'
    let msg = res[4] ? res[4].trim() : null
    command = { action: 'move', actor: actor, target: res[3], spec: 'location', message: msg }
    return command
  }

  // Move to destination
  res = rx.move_destination.exec(message) || rx.move2_destination.exec(message)
  if (res) {
    let actor = res[1] || ':group'
    let msg = res[4] ? res[4].trim() : null
    command = { action: 'move', actor: actor, target: res[3], spec: 'destination', message: msg }
    return command
  }

  // Move to undefined
  res = rx.move_undefined.exec(message)
  if (res) {
    let actor = res[1] || ':group'
    let msg = res[4] ? res[4].trim() : null
    command = { action: 'move', actor: actor, target: res[3], spec: ':undefined', message: msg }
    return command
  }

  // Talk to :all
  res = rx.talk1all.exec(message)
  if (res) {
    command = { action: 'talk', actor: res[1], target: ':all', message: res[3].trim() }
    return command
  }
  res = rx.talk3all.exec(message)
  if (res) {
    command = { action: 'talk', actor: res[1], target: ':all', message: res[2].trim() }
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
    command = { action: 'talk', actor: actor, target: target, message: res[4].trim() }
    return command
  }

  // Resume Talk
  res = rx.talk3.exec(message)
  if (res) {
    command = { action: 'talk', actor: res[1], target: ':resume', message: res[2].trim() }
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
