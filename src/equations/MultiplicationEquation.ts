export enum Signs {
  Mult = "x",
  Equal = "="
}

export type ResultRHS = [number, Signs.Mult, number, Signs.Equal, number] // x * y = z
export type ResultLHS = [number, Signs.Equal, number, Signs.Mult, number] // z = x * y
interface MultiplicationEquationI {
  formatEqResultRHS: () => ResultRHS
  formatEqResultLHS: () => ResultLHS
}

export default class MultiplicationEquation implements MultiplicationEquationI {
  private value1: number
  private value2: number
  private result: number

  constructor(value1, value2) {
    this.value1 = value1
    this.value2 = value2
    this.result = value1 * value2
  }

  formatEqResultRHS: () => ResultRHS = () => [
    this.value1,
    Signs.Mult,
    this.value2,
    Signs.Equal,
    this.result
  ]

  formatEqResultLHS: () => ResultLHS = () => [
    this.result,
    Signs.Equal,
    this.value1,
    Signs.Mult,
    this.value2
  ]

  formatRHEq = () => [this.value1, "x", this.value2, "=", this.result]
  getResult = () => this.value1 * this.value2
}
