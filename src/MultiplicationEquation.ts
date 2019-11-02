enum Signs {
  Mult = "x",
  Equal = "="
}

type ResultLHS = [number, Signs.Equal, number, Signs.Mult, number]
type ResultRHS = [number, Signs.Mult, number, Signs.Equal, number]

interface MultiplicationEquationI {
  formatEqResultLHS: () => ResultLHS
  formatEqResultRHS: () => ResultRHS
}

export default class MultiplicationEquation implements MultiplicationEquationI {
  private value1: number = null
  private value2: number = null
  private result: number = null

  constructor(value1, value2) {
    this.value1 = value1
    this.value2 = value2
    this.result = value1 * value2
  }

  formatEqResultLHS: () => ResultLHS = () => [
    this.result,
    Signs.Equal,
    this.value1,
    Signs.Mult,
    this.value2
  ]

  formatEqResultRHS: () => ResultRHS = () => [
    this.value1,
    Signs.Mult,
    this.value2,
    Signs.Equal,
    this.result
  ]

  formatRHEq = () => [this.value1, "x", this.value2, "=", this.result]
  getResult = () => this.value1 * this.value2
}
