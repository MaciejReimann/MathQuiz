import MultiplicationEquation from "../MultiplicationEquation"

describe("MultiplicationEquation", () => {
  const x = 2
  const mult = "x"
  const y = 4
  const eq = "="
  const z = x * y

  const multiplicationEquationRHS = new MultiplicationEquation(
    x,
    y
  ).formatEqResultRHS()

  const multiplicationEquationLHS = new MultiplicationEquation(
    x,
    y
  ).formatEqResultLHS()

  describe("formatEqResultRHS: x * y = z", () => {
    it("is an array of 5 equation elements", () => {
      expect(multiplicationEquationRHS).toHaveLength(5)
    })

    it("x is first ", () => {
      expect(multiplicationEquationRHS[0]).toBe(x)
    })

    it("multiplication sign is second ", () => {
      expect(multiplicationEquationRHS[1]).toBe(mult)
    })

    it("y is third ", () => {
      expect(multiplicationEquationRHS[2]).toBe(y)
    })

    it("equality sign is fourth ", () => {
      expect(multiplicationEquationRHS[3]).toBe(eq)
    })

    it("z is fifth ", () => {
      expect(multiplicationEquationRHS[4]).toBe(z)
    })
  })

  describe("formatEqResultLHS: z = x * y", () => {
    it("is an array of 5 equation elements", () => {
      expect(multiplicationEquationLHS).toHaveLength(5)
    })

    it("z is first ", () => {
      expect(multiplicationEquationLHS[0]).toBe(z)
    })

    it("equality sign is second ", () => {
      expect(multiplicationEquationLHS[1]).toBe(eq)
    })

    it("x is third ", () => {
      expect(multiplicationEquationLHS[2]).toBe(x)
    })

    it("multiplication sign is fourth ", () => {
      expect(multiplicationEquationLHS[3]).toBe(mult)
    })

    it("y is fifth ", () => {
      expect(multiplicationEquationLHS[4]).toBe(y)
    })
  })
})
