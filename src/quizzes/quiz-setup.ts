import Quiz from "./Quiz"
import { buildEquationsAsArrays } from "../equations/buildEquations"
import { ResultRHS, ResultLHS } from "../equations/MultiplicationEquation"
import { convertEquationToQuizQuestion } from "./convertEquationToQuizQuestion"
import QuizQuestion, { QuizQuestionListeners } from "./QuizQuestion"
import { MULTIPLICATION_TABLE, APP_PREFIX } from "./constants"
import { QuizConfig } from "./quiz-config"

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
      convertEquationToQuizQuestion(
        equation,
        shape,
        generateQuestionName(i, shape, name),
        listeners
      )
    )

    return new Quiz(generateQuizName(shape, name), quizQuestions, {
      shuffled: !isMultiplicationTable
    })
  })
}

const generateQuizName = (shape?, name?) =>
  `${APP_PREFIX}.${name ? name : `SingleEquations`}.${shape}`

const generateQuestionName = (i: number, shape?, name?) =>
  `${generateQuizName(shape, name)}.${i}`
