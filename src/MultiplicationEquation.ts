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

export interface XYRangeI {
  xMin?: number
  xMax: number
  yMin?: number
  yMax: number
}

export class MultiplicationEquationBuilder {
  static getFromRange = (range: XYRangeI) =>
    [...new Array(range.xMax)]
      .slice(range.xMin, range.xMax)
      .map((_, i) => (range.xMin ? i + range.xMin : i))
      .map(i =>
        [...new Array(range.yMax)]
          .slice(range.yMin, range.yMax)
          .map((_, j) => (range.yMin ? j + range.yMin : j))
          .map(j => new MultiplicationEquation(i + 1, j + 1))
      )

      .flat()

  // x * y = z
  static getFromRangeRHS = (range: XYRangeI): ResultRHS[] =>
    MultiplicationEquationBuilder.getFromRange(range).map(eq =>
      eq.formatEqResultRHS()
    )

  // z = x * y
  static getFromRangeLHS = (range: XYRangeI): ResultLHS[] =>
    MultiplicationEquationBuilder.getFromRange(range).map(eq =>
      eq.formatEqResultLHS()
    )
}
