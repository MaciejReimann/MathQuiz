import MultiplicationEquation from "./MultiplicationEquation"
import QuizQuestion, { QuizQuestionListeners } from "./QuizQuestion"

export type InputSymbol = "|_|"

export function equationQuizAdapter(
  ID: string,
  equation: any[],
  position: number,
  listeners: QuizQuestionListeners
): QuizQuestion {
  const question = [
    ...equation.slice(0, position),
    "|_|",
    ...equation.slice(position + 1, equation.length)
  ]
  const correctAnswers = equation[position].toString()
  return new QuizQuestion(ID, question, [correctAnswers], listeners)
}
