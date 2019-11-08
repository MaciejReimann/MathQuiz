import MultiplicationEquation, {
  ResultRHS,
  ResultLHS
} from "./MultiplicationEquation"

export interface XYRangeI {
  xMin?: number
  xMax: number
  yMin?: number
  yMax: number
}

export default class MultiplicationEquationBuilder {
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
