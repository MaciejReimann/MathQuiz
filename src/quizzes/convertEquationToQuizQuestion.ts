import QuizQuestion, { QuizQuestionListeners } from "./QuizQuestion"
import { EquationShapes } from "../equations/buildEquations"
import { INPUT_SYMBOL } from "./constants"

export function convertEquationToQuizQuestion(
  equation: (number | string)[],
  shape: EquationShapes,
  quizName: string,
  listeners: QuizQuestionListeners
): QuizQuestion {
  const inputPosition = getInputPositionFromShape(shape)

  const question = [
    ...equation.slice(0, inputPosition),
    INPUT_SYMBOL,
    ...equation.slice(inputPosition + 1, equation.length)
  ]

  const correctAnswers = [equation[inputPosition].toString()]

  return new QuizQuestion(quizName, question, correctAnswers, listeners)
}

const getInputPositionFromShape = (shape: EquationShapes): number =>
  shape.includes(INPUT_SYMBOL) ? shape.indexOf(INPUT_SYMBOL) : shape.length - 1
