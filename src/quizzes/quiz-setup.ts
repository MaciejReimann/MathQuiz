import Quiz from "./Quiz"
import MultiplicationEquationBuilder, {
  XYRangeI
} from "../equations/MultiplicationEquationBuilder"
import {
  Signs,
  ResultRHS,
  ResultLHS
} from "../equations/MultiplicationEquation"
import { adaptEquationToQuizQuestion } from "./adaptEquationToQuizQuestion"
import QuizQuestion, { QuizQuestionListeners } from "./QuizQuestion"

export function createEquationQuizzesFromConfig(
  config: QuizConfig[],
  listeners: QuizQuestionListeners
) {
  return config.map(({ id, range }) => {
    const isLHS = id.indexOf(Signs.Equal) < id.length - 3

    const equations: (ResultRHS | ResultLHS)[] = isLHS
      ? MultiplicationEquationBuilder.getFromRangeLHS(range)
      : MultiplicationEquationBuilder.getFromRangeRHS(range)

    const quizQuestions: QuizQuestion[] = equations.map((eq, i) =>
      adaptEquationToQuizQuestion(eq, `${id}-${i}`, listeners)
    )
    return new Quiz(id, quizQuestions, 9, { shuffled: true })
  })
}

export interface QuizConfig {
  id: string // specify one of enum
  range: XYRangeI
}

export const quizConfig: QuizConfig[] = [
  {
    id: "x*y=_",
    range: {
      xMin: 1,
      xMax: 10,
      yMin: 1,
      yMax: 10
    }
  },
  {
    id: "_*y=z",
    range: {
      xMin: 1,
      xMax: 10,
      yMin: 1,
      yMax: 10
    }
  },
  {
    id: "z=_*y",
    range: {
      xMin: 1,
      xMax: 10,
      yMin: 1,
      yMax: 10
    }
  },
  {
    id: "table",
    range: {
      xMin: 0,
      xMax: 10,
      yMin: 0,
      yMax: 10
    }
  }
]
