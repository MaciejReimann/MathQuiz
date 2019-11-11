import Quiz from "./Quiz"
import MultiplicationEquationBuilder, {
  XYRangeI
} from "../equations/MultiplicationEquationBuilder"
import {
  Signs,
  ResultRHS,
  ResultLHS
} from "../equations/MultiplicationEquation"
import { convertEquationToQuizQuestion } from "./convertEquationToQuizQuestion"
import QuizQuestion, { QuizQuestionListeners } from "./QuizQuestion"

export function createEquationQuizzesFromConfig(
  config: QuizConfig[],
  listeners: QuizQuestionListeners
) {
  return config.map(({ shape, range, name }) => {
    const isMultiplicationTable = name === MULTIPLICATION_TABLE

    const equations: (ResultRHS | ResultLHS)[] = createEquationSet(shape, range)

    const quizQuestions: QuizQuestion[] = equations.map((equation, i) =>
      convertEquationToQuizQuestion(equation, `${shape}-${i}`, listeners)
    )
    return new Quiz(name || shape, quizQuestions, {
      shuffled: !isMultiplicationTable
    })
  })
}

const createEquationSet = (shape, range) =>
  isEquationLeftHandSide(shape)
    ? MultiplicationEquationBuilder.getFromRangeLHS(range)
    : MultiplicationEquationBuilder.getFromRangeRHS(range)

const isEquationLeftHandSide = equationShape =>
  equationShape.indexOf(Signs.Equal) < equationShape.length - 3

export interface QuizConfig {
  shape: string
  name?: string
  range: XYRangeI
}
export const INPUT_SYMBOL = "_"

export const MULTIPLICATION_TABLE = "multiplication-table"

export const quizConfig: QuizConfig[] = [
  {
    shape: "x*y=_",
    range: {
      xMin: 1,
      xMax: 10,
      yMin: 1,
      yMax: 10
    }
  },
  {
    shape: "_*y=z",
    range: {
      xMin: 1,
      xMax: 10,
      yMin: 1,
      yMax: 10
    }
  },
  {
    shape: "z=_*y",
    range: {
      xMin: 1,
      xMax: 10,
      yMin: 1,
      yMax: 10
    }
  },
  {
    shape: "x*y=_",
    name: MULTIPLICATION_TABLE,
    range: {
      xMin: 0,
      xMax: 10,
      yMin: 0,
      yMax: 10
    }
  }
]
