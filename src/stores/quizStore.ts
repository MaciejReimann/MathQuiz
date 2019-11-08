import { writable } from "svelte/store"
import { scoreStore } from "./scoreStore"
import {
  quizConfig,
  createEquationQuizzesFromConfig
} from "../quizzes/quiz-setup"
import { QuizQuestionListeners } from "../quizzes/QuizQuestion"

function createQuizStore(quizzes) {
  const quizzesID = quizzes.map(quiz => quiz.getID())
  const { subscribe, set, update } = writable(quizzesID[0])

  return {
    subscribe,
    next: () => update(n => quizzesID[quizzesID.indexOf(n) + 1]),
    previous: () => update(n => quizzesID[quizzesID.indexOf(n) - 1]),
    goTo: n => set(n),
    getAllIDs: () => quizzesID
    // getCurrentQuiz: () => quizzes
  }
}

const listeners: QuizQuestionListeners = {
  onSubmitAnswer: () => {},
  onSubmitCorrectAnswer: scoreStore.increment(),
  onSubmitIncorrectAnswer: scoreStore.resetStrike()
}

const quizzes = createEquationQuizzesFromConfig(quizConfig, listeners)

export const quizStore = createQuizStore(quizzes)
