export const defaultsBook = {
  description: 'An Interactive Morpheus Book',
  tags: [],
  features: [],
  cover: '',
}
export const defaultsBookStart = {
  datetime: '2020-01-01 12:00:00',
  introduction: 'Your story starts now!',
}
export const defaultsBookOptions = {
  minPlayerChars: 1,
  maxPlayerChars: 99,
  talkDuration: 30,
  moveDurationRoom: 0,
  moveDurationLocation: 60,
  moveDurationDestination: 3600,
}

export const defaultsWorld = {
  name: 'Unnamed World',
  description: 'No description',
  image: '',
}

export const defaultsCharacter = {
  isPlayable: false,
  isNPC: true,
  description: 'No description',
  description_player: '',
  image: '',
  profession: 'Employed',
  behavior: 'Friendly',
  body: 'Average body',
  clothing: 'Casual outfit',
  appearance: 'Normal appearance',
  background: '',
  states: [],
  load_states: [],
  load_agendas: [],
}

export const defaultsState = {
  base: 0,
  change: {
    default: 0,
    move: 0,
    sleep: 0,
    context: [-5, -2, +2, +5],
  },
  intervals: [],
  events: [],
}

export const defaultsDestination = {
  description: 'No description',
  position: [0, 0],
  detour: 0,
  entry: '',
  image: '',
}

export const defaultsLocation = {
  description: 'No description',
  position: [0, 0],
  detour: 0,
  entry: '',
  image: '',
}

export const defaultsRoom = {
  description: 'No description',
  image: '',
  actions: [],
}
