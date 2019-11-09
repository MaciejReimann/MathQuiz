import { writable } from "svelte/store"
import { scoreStore } from "./scoreStore"
import {
  quizConfig,
  createEquationQuizzesFromConfig
} from "../quizzes/quiz-setup"
import { QuizQuestionListeners } from "../quizzes/QuizQuestion"

function createQuizStore(quizzes) {
  const quizzesID = quizzes.map(quiz => quiz.getID())

  const { subscribe, set, update } = writable({
    quizID: quizzesID[0],
    questionNo: 0
  })

  let currentId
  let currentQuestionNo

  subscribe(val => {
    currentId = val.quizID
    currentQuestionNo = val.questionNo
  })

  const next = () => update(n => ({ ...n, quizID: n.quizID + 1 }))
  const previous = () => update(n => ({ ...n, quizID: n.quizID - 1 }))
  const goTo = quizID => update(n => ({ ...n, quizID }))

  const getAllIDs = () => quizzesID
  const getCurrentQuiz = () => quizzes[quizzesID.indexOf(currentId)]
  const getCurrentQuestion = () =>
    getCurrentQuiz().getQuestion(currentQuestionNo)

  const onSubmitAnswer = () =>
    update(n => ({
      ...n,
      questionNo: n.questionNo + 1
    }))

  return {
    subscribe,
    next,
    previous,
    goTo,
    getAllIDs,
    getCurrentQuiz,
    getCurrentQuestion,
    onSubmitAnswer
  }
}

const listeners: QuizQuestionListeners = {
  onSubmitAnswer: () => {},
  onSubmitCorrectAnswer: () => scoreStore.increment(),
  onSubmitIncorrectAnswer: () => scoreStore.resetStrike()
}

const quizzes = createEquationQuizzesFromConfig(quizConfig, listeners)

export const quizStore = createQuizStore(quizzes)
