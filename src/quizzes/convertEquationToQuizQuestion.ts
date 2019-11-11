import QuizQuestion, { QuizQuestionListeners } from "./QuizQuestion"
import { INPUT_SYMBOL } from "./constants"

export function convertEquationToQuizQuestion(
  equation: (number | string)[],
  id: string,
  listeners: QuizQuestionListeners
): QuizQuestion {
  const inputPosition =
    id.indexOf(INPUT_SYMBOL) > -1 ? id.indexOf(INPUT_SYMBOL) : id.length - 1

  const question = [
    ...equation.slice(0, inputPosition),
    INPUT_SYMBOL,
    ...equation.slice(inputPosition + 1, equation.length)
  ]

  const correctAnswers = [equation[inputPosition].toString()]

  return new QuizQuestion(id, question, correctAnswers, listeners)
}

const isIdValid = id => {}

const getInputPositionFromId = id => {}
