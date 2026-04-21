import { defaultsState } from '@/data/defaults'

export default class State {
  constructor(rawData) {
    const data = { ...defaultsState, ...rawData }
    ;['id', 'name', 'base', 'change', 'intervals', 'events'].forEach(
      (key) => (this[key] = data[key]),
    )
    this.value = this.base
  }
  static fromJSON(data) {
    const proto = new State(data)
    proto.value = data.value
    return proto
  }

  // Save object state to JSON
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      base: this.base,
      value: this.value,
      change: this.change,
      intervals: this.intervals,
      events: this.events,
    }
  }

  // Getter: Current behaviour influence
  get effect() {
    return this.intervals
      .filter((interval) => this.value >= interval.values[0] && this.value <= interval.values[1])
      .map((interval) => interval.effect)
      .join(' ')
  }
}
