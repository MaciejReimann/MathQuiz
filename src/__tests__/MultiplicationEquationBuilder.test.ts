import { MultiplicationEquationBuilder } from "../MultiplicationEquation"

describe("MultiplicationEquationBuilder", () => {
  test("getFromRange without minimum range", () => {
    const equations = MultiplicationEquationBuilder.getFromRange({
      xMax: 4,
      yMax: 4
    })
    expect(equations).toHaveLength(16)
  })

  test("getFromRange with minimum x range", () => {
    const equations = MultiplicationEquationBuilder.getFromRange({
      xMin: 2,
      xMax: 4,
      yMax: 4
    })
    expect(equations).toHaveLength(8)
  })

  test("getFromRange with minimum x and y range", () => {
    const equations = MultiplicationEquationBuilder.getFromRange({
      xMin: 2,
      xMax: 4,
      yMin: 1,
      yMax: 4
    })
    expect(equations).toHaveLength(6)
  })

  test("getFromRangeRHS", () => {
    const equationsRHS = MultiplicationEquationBuilder.getFromRangeRHS({
      xMax: 2,
      yMax: 2
    })
    const firstEquation = equationsRHS[0]
    const lastEquation = equationsRHS[3]

    expect(equationsRHS).toHaveLength(4)

    expect(firstEquation).toHaveLength(5)
    expect(firstEquation[0]).toBe(1)
    expect(firstEquation[1]).toBe("x")
    expect(firstEquation[2]).toBe(1)
    expect(firstEquation[3]).toBe("=")
    expect(firstEquation[4]).toBe(1)

    expect(lastEquation).toHaveLength(5)
    expect(lastEquation[0]).toBe(2)
    expect(lastEquation[1]).toBe("x")
    expect(lastEquation[2]).toBe(2)
    expect(lastEquation[3]).toBe("=")
    expect(lastEquation[4]).toBe(4)
  })

  test("getFromRangeLHS", () => {
    const equationsLHS = MultiplicationEquationBuilder.getFromRangeLHS({
      xMin: 2,
      xMax: 4,
      yMin: 2,
      yMax: 4
    })

    const firstEquation = equationsLHS[0]
    const lastEquation = equationsLHS[3]

    expect(equationsLHS).toHaveLength(4)

    expect(firstEquation).toHaveLength(5)
    expect(firstEquation[0]).toBe(9)
    expect(firstEquation[1]).toBe("=")
    expect(firstEquation[2]).toBe(3)
    expect(firstEquation[3]).toBe("x")
    expect(firstEquation[4]).toBe(3)

    expect(lastEquation).toHaveLength(5)
    expect(lastEquation[0]).toBe(16)
    expect(lastEquation[1]).toBe("=")
    expect(lastEquation[2]).toBe(4)
    expect(lastEquation[3]).toBe("x")
    expect(lastEquation[4]).toBe(4)
  })
})
