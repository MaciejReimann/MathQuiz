import { EquationShapes } from "../equations/buildEquations"
import { XYRangeI } from "../equations/range"
import { MULTIPLICATION_TABLE } from "./constants"

export interface QuizConfig {
  shape: EquationShapes
  name?: string
  range: XYRangeI
}

export const quizConfig: QuizConfig[] = [
  {
    shape: EquationShapes["x*y=_"],
    range: {
      xMin: 1,
      xMax: 10,
      yMin: 1,
      yMax: 10
    }
  },
  {
    shape: EquationShapes["_*y=z"],
    range: {
      xMin: 1,
      xMax: 10,
      yMin: 1,
      yMax: 10
    }
  },
  {
    shape: EquationShapes["z=_*y"],
    range: {
      xMin: 1,
      xMax: 10,
      yMin: 1,
      yMax: 10
    }
  },
  {
    shape: EquationShapes["x*y=_"],
    name: MULTIPLICATION_TABLE,
    range: {
      xMin: 0,
      xMax: 10,
      yMin: 0,
      yMax: 10
    }
  }
]
