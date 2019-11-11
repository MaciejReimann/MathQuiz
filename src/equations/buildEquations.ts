import {
  RHSMultiplicationEquation,
  LHSMultiplicationEquation,
  ResultRHS,
  ResultLHS,
  Signs
} from "./MultiplicationEquation"
import { Range, XYRangeI } from "./range"

export enum EquationShapes {
  "x*y=_" = "x*y=_",
  "x*_=z" = "x*_=z",
  "_*y=z" = "_*y=z",
  "_=x*y" = "_=x*y",
  "z=_*y" = "z=_*y",
  "z=x*_" = "z=x*_"
}

export const buildEquations = (
  range: XYRangeI,
  shape: EquationShapes
): (LHSMultiplicationEquation | RHSMultiplicationEquation)[] =>
  new Range<LHSMultiplicationEquation | RHSMultiplicationEquation>(
    range,
    isEquationLeftHandSide(shape)
      ? LHSMultiplicationEquation
      : RHSMultiplicationEquation
  ).get()

export const buildEquationsAsArrays = (
  range: XYRangeI,
  shape: EquationShapes
): (ResultRHS | ResultLHS)[] =>
  buildEquations(range, shape).map(eq => eq.getAsArray())

export const isEquationLeftHandSide = equationShape => {
  console.log(equationShape)
  return equationShape.indexOf(Signs.Equal) < equationShape.length - 3
}
