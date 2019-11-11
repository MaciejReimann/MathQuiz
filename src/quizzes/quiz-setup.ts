import Quiz from "./Quiz"
import {
  buildEquationsAsArrays,
  EquationShapes
} from "../equations/buildEquations"
import { ResultRHS, ResultLHS } from "../equations/MultiplicationEquation"
import { XYRangeI } from "../equations/range"
import { convertEquationToQuizQuestion } from "./convertEquationToQuizQuestion"
import QuizQuestion, { QuizQuestionListeners } from "./QuizQuestion"
import { MULTIPLICATION_TABLE, APP_PREFIX } from "./constants"

export function createEquationQuizzesFromConfig(
  config: QuizConfig[],
  listeners: QuizQuestionListeners
) {
  return config.map(({ shape, range, name }) => {
    const isMultiplicationTable = name === MULTIPLICATION_TABLE

    const equations: (ResultRHS | ResultLHS)[] = buildEquationsAsArrays(
      range,
      shape
    )

    const quizQuestions: QuizQuestion[] = equations.map((equation, i) =>
      convertEquationToQuizQuestion(equation, shape, i, listeners)
    )

    const quizName = generateQuizName(shape, name)

    return new Quiz(quizName, quizQuestions, {
      shuffled: !isMultiplicationTable
    })
  })
}

const generateQuizName = (shape?, name?) =>
  `${APP_PREFIX}.${name ? name : `SingleEquations`}.${shape}`

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
