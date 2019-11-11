export enum Signs {
  Mult = "x",
  Equal = "="
}

export type ResultRHS = [number, Signs.Mult, number, Signs.Equal, number] // x * y = z
export type ResultLHS = [number, Signs.Equal, number, Signs.Mult, number] // z = x * y

interface MultiplicationEquationI {}

export default class MultiplicationEquation implements MultiplicationEquationI {
  value1: number
  value2: number
  result: number

  constructor(value1: number, value2: number) {
    this.value1 = value1
    this.value2 = value2
    this.result = value1 * value2
  }

  formatRHEq = () => [this.value1, "x", this.value2, "=", this.result] // delete this
  getResult = () => this.value1 * this.value2 // delete this
}

interface RHSMultiplicationEquationI {
  getAsArray: () => ResultRHS
}
export class RHSMultiplicationEquation extends MultiplicationEquation
  implements RHSMultiplicationEquationI {
  constructor(value1, value2) {
    super(value1, value2)
  }
  getAsArray = (): ResultRHS => [
    this.value1,
    Signs.Mult,
    this.value2,
    Signs.Equal,
    this.result
  ]
}
interface LHSMultiplicationEquationI {
  getAsArray: () => ResultLHS
}
export class LHSMultiplicationEquation extends MultiplicationEquation
  implements LHSMultiplicationEquationI {
  constructor(value1, value2) {
    super(value1, value2)
  }
  getAsArray = (): ResultLHS => [
    this.result,
    Signs.Equal,
    this.value1,
    Signs.Mult,
    this.value2
  ]
}
