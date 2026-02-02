import { defineStore } from 'pinia'
import World from '@/classes/World'
import Character from '@/classes/Character'
import Destination from '@/classes/Destination'
import Protocol from '@/classes/Protocol'
import { messageToCommand, distancePeriod, getHelpData } from '@/helpers/utils'
import { useOptionsStore } from '@/stores/options'

export const useBookStore = defineStore('book', {
  state: () => ({
    // Static Book Information
    id: null,
    title: null,
    description: null,
    tags: [],
    startTime: null,
    introduction: null,
    _cover: '',

    // Book State
    loaded: false, // is book data loaded?
    started: false, // is setup complete and story started?

    // Book Components --> objects, never use as reactive references!
    world: null,
    destinations: {},
    characters: {},
    playerCharacters: {},
    aiCharacters: {},
    states: {},
    agendas: {},

    // The Protocol --> if referenced make sure a reactive component is watched
    protocol: null,

    // Registers
    movingCharacterIDs: [],

    // Game State
    destinationId: '',
    locationId: '',
    roomId: '',
    time: 0,
    recentPlayerIDs: [],
  }),

  // TODO: konsequent roomID vs room, destinationID vs. destination etc. verwenden

  getters: {
    // The options store
    options() {
      return useOptionsStore()
    },
    // Destination, Location, Room objects
    destination(state) {
      return state.destinations[state.destinationId]
    },
    location(state) {
      return this.destination.locations[state.locationId]
    },
    room(state) {
      return this.location.rooms[state.roomId]
    },

    // Current time as reactive Date object
    datetime(state) {
      const current = new Date(state.startTime)
      current.setSeconds(current.getSeconds() + state.time)
      return current
    },

    // Cover using fallback
    cover: (state) => (state._cover === '' ? 'generic_cover.jpg' : state._cover),

    activePlayerID: (state) => {
      return state.recentPlayerIDs[0]
    },

    // Playable characters only
    playableCharacters: (state) => {
      let chars = Object.values(state.characters).filter((char) => char.isPlayable)
      return chars
    },

    // Playable characters who are currently moving + time left
    movingPlayerCharacters() {
      const ids = this.movingCharacterIDs
      return this.playableCharacters.filter((char) => ids.includes(char.id))
    },

    // Available Travel Targets
    availableDestinations: (state) => {
      return Object.values(state.destinations).filter((dest) => dest.id !== state.destinationId)
    },

    // Rooms with current player characters
    activeRooms: (state) => {
      return Object.values(state.destinations).reduce((acc, destination) => {
        return acc.concat(destination.activeRooms)
      }, [])
    },
  },

  actions: {
    toJSON() {
      // don't save loaded/started states
      return {
        id: this.id,
        title: this.title,
        description: this.description,
        tags: this.tags,
        startTime: this.startTime,
        introduction: this.introduction,
        _cover: this._cover,
        world: this.world, // stringify will convert world object
        destinations: this.destinations, // stringify will convert destination objects
        characters: this.characters, // stringify will convert character objects
        playerCharacters: Object.fromEntries(
          Object.entries(this.playerCharacters).map(([key, obj]) => [key, obj.id]),
        ), // only store ids
        aiCharacters: Object.fromEntries(
          Object.entries(this.aiCharacters).map(([key, obj]) => [key, obj.id]),
        ), // only store ids
        states: this.states, // Do we need to save these?
        agendas: this.agendas, // Do we need to save these?
        protocol: this.protocol, // stringify will convert character objects
        movingCharacterIDs: this.movingCharacterIDs,
        destinationId: this.destinationId,
        locationId: this.locationId,
        roomId: this.roomId,
        time: this.time,
        recentPlayerIDs: this.recentPlayerIDs,
      }
    },

    getSetupCharacterNames() {
      return this.characters_names.filter((name) => this.characters[name].type === 'player')
    },

    addTime(duration) {
      // Increase time
      this.time = this.time + duration
      // Check Arrivals
      for (const charID of this.movingCharacterIDs) {
        let arrived = this.characters[charID].checkForArrival(this.time)
        if (arrived) {
          this.movingCharacterIDs = this.movingCharacterIDs.filter((id) => id != charID)
        }
      }
    },

    // timejump until at least one active room, switch to active room
    jumpToArrival() {
      const arrivalTime = this.movingCharacterIDs.reduce((acc, charID) => {
        return Math.min(acc, this.characters[charID].arrivalTime)
      }, 99999999)
      if (arrivalTime > this.time) {
        this.addTime(arrivalTime - this.time)
        this.switchTo(this.activeRooms[0])
      } else {
        console.error('Cannot jump to point in time with active players.')
      }
    },

    classifyCharacters(playerIds) {
      playerIds = Array.from(playerIds)

      this.playerCharacters = {}
      this.aiCharacters = {}

      for (const char of Object.values(this.characters)) {
        console.log(playerIds)
        if (playerIds.includes(char.id)) {
          char.controlledBy = 'player'
          this.playerCharacters[char.id] = char
        } else if (char.isNSC) {
          char.controlledBy = 'ai'
          this.aiCharacters[char.id] = char
        }
      }
    },

    setActivePlayerID(activeID) {
      const newRecentPlayerIDs = this.recentPlayerIDs.filter((id) => id !== activeID)
      this.recentPlayerIDs = [activeID, ...newRecentPlayerIDs]
    },

    updateRecentPlayerIDs() {
      const presentIDs = Object.values(this.room.presentPlayerCharacters).map((char) => char.id)
      const presentRecentPlayerIDs = this.recentPlayerIDs.filter((id) => presentIDs.includes(id))
      if (presentRecentPlayerIDs.length > 0) {
        this.setActivePlayerID(presentRecentPlayerIDs[0])
      } else {
        this.setActivePlayerID(presentIDs[0])
      }
    },

    getMoveSpecs(targetId, spec) {
      const resolvers = {
        room: () => {
          const targetRoom = this.room.availableRooms.find((room) => room.id === targetId)
          return { targetRoom: targetRoom, distanceTo: targetRoom }
        },
        location: () => {
          const location = this.room.availableLocations.find((location) => location.id === targetId)
          return { targetRoom: location.entry, distanceTo: location }
        },
        destination: () => {
          const destination = this.availableDestinations.find(
            (destination) => destination.id === targetId,
          )
          return { targetRoom: destination.entry, distanceTo: destination }
        },
      }

      const resolver = resolvers[spec]
      const { targetRoom, distanceTo } = resolver()
      return {
        targetRoom,
        moveDuration: distancePeriod(this.room, distanceTo),
      }
    },

    getRoomRef({ destination, location, room }) {
      return this.destinations[destination].locations[location].rooms[room]
    },

    moveChar(charID, targetRoom, duration) {
      duration = Math.floor(duration)
      this.characters[charID].moveToRoom(targetRoom, this.time + duration)
      this.movingCharacterIDs.push(charID)
    },

    // Switch user view to different room
    switchTo(room) {
      this.roomId = room.id
      this.locationId = room.location.id
      this.destinationId = room.location.destination.id
      this.updateRecentPlayerIDs()
    },

    // ########## Loading and Construction ##########

    // Build Character objects using a factory (different for loading/restoring)
    buildCharacters(rawCharacters, factory) {
      this.characters = {}
      for (const id in rawCharacters) {
        this.characters[id] = factory(rawCharacters[id])
      }
    },
    // Build Destination objects using a factory (different for loading/restoring)
    buildDestinations(rawDestinations, factory) {
      this.destinations = {}
      for (const id in rawDestinations) {
        this.destinations[id] = factory(rawDestinations[id])
      }
    },

    // Helper for load and restore
    assignBaseBookData(data) {
      this.id = data.id
      this.title = data.title
      this.description = data.description
      this.tags = data.tags
      this._cover = data._cover ?? data.cover
      if (data.start) {
        this.startTime = new Date(data.start.datetime)
        this.introduction = data.start.introduction || 'The Game Begins'
      } else {
        this.startTime = new Date(data.startTime)
        this.introduction = data.introduction
      }
    },

    // Helper for bidirectional referencing
    wireCharacterRoomReferences() {
      for (const char of Object.values(this.characters)) {
        if (char.room) {
          char.room = this.getRoomRef(char.room)
          char.room.characters[char.id] = char
        }
        if (char.arrivalTarget) {
          char.arrivalTarget = this.getRoomRef(char.arrivalTarget)
        }
      }
    },

    deactivateBook() {
      this.loaded = false
      this.started = false
    },

    activateBook(started = true) {
      this.loaded = true
      this.started = started
    },

    // load book content
    async loadBook(id) {
      this.$reset() // reset book to blank
      try {
        // In case sth goes wrong the book is inactive
        this.deactivateBook()

        // Load data
        const response = await fetch(`books/${id}.json`)
        const data = await response.json()

        // Store book base data
        this.assignBaseBookData(data)

        // Store singular components
        this.world = new World(data.world)

        // Build and store components collections
        this.buildCharacters(data.characters, (data) => new Character(data))
        this.buildDestinations(data.destinations, (data) => new Destination(data))

        // More components // TBD as classes
        this.states = data.states
        this.agendas = data.agendas

        // Set up start conditions
        this.destinationId = data.start.destination
        this.locationId = data.start.location
        this.roomId = data.start.room
        this.wireCharacterRoomReferences()

        // Book is now active but not yet started
        this.activateBook(false)
      } catch (error) {
        console.error('Error fetching book data with id ' + id, error)
      }
    },

    // Last setup steps before start
    async startBook() {
      // start fresh protocol
      this.protocol = new Protocol(this.options)
      this.protocol.pushInfo({ text: this.introduction, title: 'Introduction' })
      // build set of AI characters
      const playerIds = Object.keys(this.playerCharacters)
      this.classifyCharacters(playerIds)
      // set characters to starting conditions
      for (let id in this.playerCharacters) {
        this.moveChar(id, this.room, 0)
      }
      for (let id in this.aiCharacters) {
        const startRoom = this.getRoomRef(this.characters[id].start)
        this.moveChar(id, startRoom, 0)
      }
      this.addTime(0) // triggering arrivals and timed events at 0
      this.updateRecentPlayerIDs() // set initial active player
      this.activateBook()
    },

    // restore book from savegame
    async restoreBook(data) {
      this.$reset() // reset book to blank
      try {
        // In case something goes wrong make book inactive
        this.deactivateBook()

        // restore book data
        this.assignBaseBookData(data)
        this.world = World.fromJSON(data.world)

        // Create characters and destinations/locations/rooms
        this.buildCharacters(data.characters, (data) => Character.fromJSON(data))
        this.buildDestinations(data.destinations, (data) => Destination.fromJSON(data))

        // fix bidirectional referencing of characters and rooms
        this.wireCharacterRoomReferences()

        // create list of player and ai characters
        this.classifyCharacters(Object.keys(data.playerCharacters))

        // more book data
        this.states = data.states
        this.agendas = data.agendas
        this.protocol = Protocol.fromJSON(data.protocol, this.options)
        this.movingCharacterIDs = data.movingCharacterIDs
        this.destinationId = data.destinationId
        this.locationId = data.locationId
        this.roomId = data.roomId
        this.time = data.time
        this.recentPlayerIDs = data.recentPlayerIDs

        // now activate book for play
        this.activateBook()
      } catch (error) {
        console.error('Error loading book savefile', error)
      }
    },

    // ########## Game Processing ##########

    // Process command (from AI or processed user message)
    async executeCommand(command) {
      const present = Object.keys(this.room.characters)

      // Action TALK
      if (command.action === 'talk') {
        // Process :active actor if used
        if (command.actor === ':active') {
          command.actor = this.activePlayerID
        } else {
          this.setActivePlayerID(command.actor)
        }

        // Process :resume if used
        if (command.target === ':resume') {
          const lastSpokenToID = this.protocol.lastSpokenTo(command.actor)
          if (lastSpokenToID && this.room.isInRoom(lastSpokenToID)) {
            command.target = lastSpokenToID
          } else {
            command.target = ':all'
          }
        }

        // Send TALK message
        this.protocol.pushTalk({
          text: command.message,
          present: present,
          from: command.actor,
          to: command.target,
        })
      }

      // Action MOVE
      if (command.action === 'move') {
        if ((command.message !== null) & (command.actor === ':group')) {
          this.protocol.pushError({
            title: 'Invalid Command',
            text: 'You cannot send an exit message if the group moves together.\n\n**Original message**\n${message}',
          })
          return
        }

        // Process target spec
        if (command.spec === ':undefined') {
          if (this.room.availableRooms.map((room) => room.id).includes(command.target)) {
            command.spec = 'room'
          } else if (this.room.availableLocations.map((loc) => loc.id).includes(command.target)) {
            command.spec = 'location'
          } else if (this.availableDestinations.map((dest) => dest.id).includes(command.target)) {
            command.spec = 'destinations'
          } else {
            this.protocol.pushError({
              title: 'Could not identify move target',
              text: `'${command.target}' seems not to be valid place you can go to right now.`,
            })
            return
          }
        }

        // Construct info message
        let charMoving
        if (command.actor === ':group') {
          charMoving = this.room.presentPlayerCharacters.map((char) => char.name).join(', ')
        } else {
          charMoving = this.characters[command.actor].name
        }
        const infoMessage = `${charMoving} just left ${this.room.name}`

        // Move actors
        const { targetRoom, moveDuration } = this.getMoveSpecs(command.target, command.spec)
        if (command.actor === ':group') {
          for (const char of this.room.presentPlayerCharacters) {
            this.moveChar(char.id, targetRoom, moveDuration)
          }
        } else {
          this.setActivePlayerID(command.actor)
          this.moveChar(command.actor, targetRoom, moveDuration)
        }

        // Send TALK message
        if (command.message !== null) {
          this.protocol.pushTalk({ text: command.message, present: present, from: command.actor }) // TODO: WHAT IF ACTOR IS GROUP?
        }
        // Send INFO message
        this.protocol.pushHint({ text: infoMessage, present: present })

        // If current room now empty move to next room with players
        if (this.room.numberOfPlayers === 0) {
          if (this.activeRooms.length) {
            this.switchTo(this.activeRooms[0])
          } else {
            this.jumpToArrival()
          }
        }
        this.updateRecentPlayerIDs() // if active player is no longer in active room
      }
    },

    // Process message (send from user)
    async sendMessage(message) {
      const command = messageToCommand(message)

      // Command Failure
      if (command.action === 'error') {
        this.protocol.pushError({
          text: `**Original message**\n${message}`,
          title: command.message,
        })
        return
      }

      // Meta commands
      if (command.action === 'help') {
        const help = getHelpData(command.topic)
        this.protocol.pushInfo({ text: help.text, title: help.title })
        return
      }

      const possibleActors = [
        ...this.room.presentPlayerCharacters.map((char) => char.id),
        ':active',
        ':group',
      ]
      if (!possibleActors.includes(command.actor)) {
        this.protocol.pushError({
          title: `${command.actor} is no viable actor`,
          text: `**Original message**\n${message}`,
        })
        return
      }
      this.executeCommand(command)
    },
  },
})
