import QuizQuestion, { QuizQuestionListeners } from "./QuizQuestion"

export type InputSymbol = "|_|"

export function adaptEquationToQuizQuestion(
  equation: any[],
  id: string,
  listeners: QuizQuestionListeners
): QuizQuestion {
  const inputPosition =
    id.indexOf("_") > -1 ? id.indexOf("_") : equation.length - 1

  const question = [
    ...equation.slice(0, inputPosition),
    "|_|",
    ...equation.slice(inputPosition + 1, equation.length)
  ]

  const correctAnswers = equation[inputPosition].toString()

  return new QuizQuestion(id, question, [correctAnswers], listeners)
}
