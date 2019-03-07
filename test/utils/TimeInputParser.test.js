import TimeInputParser from "../../src/js/utils/TimeInputParser"

function parseSeconds(input) {
  return new TimeInputParser(input).parseSeconds()
}

describe("utils", () => {
  describe("TimeInputParser", () => {
    it("parses decimal", () => {
      expect(parseSeconds("1.5")).toEqual(5400)
      expect(parseSeconds("1,333")).toEqual(4799)
    })

    it("parses time", () => {
      expect(parseSeconds("2:20")).toEqual(8400)
      expect(parseSeconds("0:30")).toEqual(1800)
    })

    it("parses minutes", () => {
      expect(parseSeconds("2m")).toEqual(120)
      expect(parseSeconds("45min")).toEqual(2700)
      expect(parseSeconds("120mins")).toEqual(7200)
    })

    it("parses range", () => {
      expect(parseSeconds("10:15-12:45")).toEqual(9000)
      expect(parseSeconds("8.00-12:15")).toEqual(15300)
      expect(parseSeconds("1000-12.20")).toEqual(8400)
    })

    it("parses hours and minuts", () => {
      expect(parseSeconds("1h 15min")).toEqual(4500)
      expect(parseSeconds("2h30m")).toEqual(9000)
    })
  })
})
