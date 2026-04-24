import { defaultsState } from '@/data/defaults'
import { clamp } from '@/helpers/utils'
import { useOptionsStore } from '@/stores/options'

export default class State {
  options = useOptionsStore()

  constructor(rawData) {
    const data = { ...defaultsState, ...rawData }
    ;['id', 'name', 'description', 'examples', 'base', 'change', 'intervals', 'events'].forEach(
      (key) => (this[key] = data[key]),
    )
    this.value = this.base
    this.history = [[0, this.value]] // [Timestamp, Value]
  }
  static fromJSON(data) {
    const proto = new State(data)
    proto.value = data.value
    proto.history = data.history
    return proto
  }

  // Save object state to JSON
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      examples: this.examples,
      base: this.base,
      value: this.value,
      history: this.history,
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

  // Change state value
  changeValue(change) {
    this.value = clamp(this.value + change, 0, 100)
  }

  // Update state and determine events
  passTime({ startTime, duration, action = '' }) {
    // Process time-based change
    if (action in this.change) {
      this.changeValue((duration / 3600) * this.change[action])
    } else {
      this.changeValue((duration / 3600) * this.change.default)
    }

    // Update history
    if (this.history.length > 1) {
      this.history.filter(
        (entry) => entry[0] >= startTime + duration - this.options.lookbackStateEvents,
      )
    }

    // Check current value for events
    const events = []
    if (this.history.every((entry) => this.value < entry[1])) {
      // Value descrease
      for (const event of this.events) {
        if (
          'below' in event &&
          this.value < event.below &&
          this.history.every((entry) => entry[1] >= event.below)
        ) {
          events.push({ type: 'stateEvent', rawMessage: event.hint })
        }
      }
    } else if (this.history.every((entry) => this.value > entry[1])) {
      for (const event of this.events) {
        if (
          'above' in event &&
          this.value > event.above &&
          this.history.every((entry) => entry[1] <= event.above)
        ) {
          events.push({ type: 'stateEvent', rawMessage: event.hint })
        }
      }
    }

    // Update history
    this.history.push([startTime + duration, this.value])

    return events
  }
}
