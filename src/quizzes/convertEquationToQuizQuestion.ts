import QuizQuestion, { QuizQuestionListeners } from "./QuizQuestion"
import { EquationShapes } from "../equations/buildEquations"
import { INPUT_SYMBOL, ERROR_MESSAGE_INVALID_EQUATION_SHAPE } from "./constants"

export function convertEquationToQuizQuestion(
  equation: (number | string)[],
  shape: EquationShapes,
  id: number,
  listeners: QuizQuestionListeners
): QuizQuestion {
  const inputPosition = getInputPositionFromShape(shape)

  const question = [
    ...equation.slice(0, inputPosition),
    INPUT_SYMBOL,
    ...equation.slice(inputPosition + 1, equation.length)
  ]

  const correctAnswers = [equation[inputPosition].toString()]

  const quizQuestionId = generateQuizQuestionId(shape, id)

  return new QuizQuestion(quizQuestionId, question, correctAnswers, listeners)
}

const getInputPositionFromShape = (shape: EquationShapes): number =>
  shape.indexOf(INPUT_SYMBOL) > -1
    ? shape.indexOf(INPUT_SYMBOL)
    : shape.length - 1

const generateQuizQuestionId = (shape: EquationShapes, id: number): string =>
  JSON.stringify({ shape, id })
