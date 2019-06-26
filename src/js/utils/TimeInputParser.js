export default class TimeInputParser {
  #input

  constructor(input) {
    this.#input = input.toLowerCase().replace(/[\s()]/g, "")
  }

  parseSeconds() {
    if (this.#isDecimal()) {
      return Math.round(parseFloat(this.#parseDecimal()) * 3600)
    } else if (this.#isTime()) {
      return this.#parseTimeAsSeconds()
    } else if (this.#isMinutes()) {
      return this.#parseMinutesAsSeconds()
    } else if (this.#isRange()) {
      return this.#parseRange()
    } else if (this.#isHoursAndMinutes()) {
      return this.#parseHoursAndMinutes()
    } else {
      return Math.round(parseFloat(this.#parseDecimal()) * 3600)
    }
  }

  #calculateFromHoursAndMinutes = (hours, minutes, isNegative) => {
    const calculated = hours * 3600 + minutes * 60

    return isNegative ? -calculated : calculated
  }

  #parseDecimal = () => {
    return this.#input.replace(/[.,]/g, ".")
  }

  #parseTimeAsSeconds = () => {
    const match = this.#isTime()

    const isNegative = "-" == match[1]
    const hours = parseInt(match[2])
    const minutes = parseInt(match[3])

    return this.#calculateFromHoursAndMinutes(hours, minutes, isNegative)
  }

  #parseMinutesAsSeconds = () => {
    const minutes = parseInt(this.#isMinutes()[1])
    return minutes * 60
  }

  #parseRange = () => {
    const match = this.#isRange()

    const from_hours = parseInt(match[1])
    const from_minutes = parseInt(match[2])
    const to_hours = parseInt(match[3])
    const to_minutes = parseInt(match[4])
    return (to_hours - from_hours) * 3600 + (to_minutes - from_minutes) * 60
  }

  #parseHoursAndMinutes = () => {
    const match = this.#isHoursAndMinutes()

    const isNegative = "-" == match[1]
    const hours = parseInt(match[2])
    const minutes = parseInt(match[3])

    return this.#calculateFromHoursAndMinutes(hours, minutes, isNegative)
  }

  #isDecimal = () => {
    return this.#input.match(/^([-]?[0-9]{0,2})[.,]{1}([0-9]{1,2})$/)
  }

  #isTime = () => {
    return this.#input.match(/^([-]?)([0-9]{1,2}):([0-9]{2})$/)
  }

  #isMinutes = () => {
    return this.#input.match(/^([-]?[0-9]{1,3})(m|mins?)$/)
  }

  #isRange = () => {
    return this.#input.match(/^([0-9]{1,2})[:.]{0,1}([0-9]{2})-([0-9]{1,2})[:.]{0,1}([0-9]{2})$/)
  }

  #isHoursAndMinutes = () => {
    // 1h 14m(in)
    return this.#input.match(/^([-]?)([0-9]{1,2})h([0-9]{1,2})(m|mins?)$/)
  }
}
