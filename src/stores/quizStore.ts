import { writable } from "svelte/store"
import { scoreStore } from "./scoreStore"
import {
  quizConfig,
  createEquationQuizzesFromConfig
} from "../quizzes/quiz-setup"
import { QuizQuestionListeners } from "../quizzes/QuizQuestion"

function createQuizStore(quizzes) {
  const quizNames = quizzes.map(quiz => quiz.getName())

  const { subscribe, set, update } = writable({
    quizName: quizNames[0],
    questionNo: 0
  })

  let currentQuizName
  let currentQuestionNo

  subscribe(val => {
    currentQuizName = val.quizName
    currentQuestionNo = val.questionNo
  })

  const next = () => update(n => ({ ...n, quizName: n.quizName + 1 }))
  const previous = () => update(n => ({ ...n, quizName: n.quizName - 1 }))
  const goTo = quizName => update(n => ({ ...n, quizName }))

  const getAllQuizNames = () => quizNames
  const getCurrentQuiz = () => quizzes[quizNames.indexOf(currentQuizName)]
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
    getAllQuizNames,
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
