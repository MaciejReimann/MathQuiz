import isFunction from "lodash"
export interface QuizQuestionI {
  index: string
  question: any[]
  correctAnswers: any[]
  submittedAnswers: any[]
  correctAnswerCount: number
}

export interface QAI {
  question: any[]
  correctAnswers: any[]
}

export default class Quiz {
  private quizQuestions: QuizQuestionI[] = null
  private quizID: string = null
  private listeners: {
    onSubmitAnswer: () => void
    onSubmitCorrectAnswer: (id: string) => void
    onSubmitIncorrectAnswer: (id: string) => void
  }

  constructor(arrayOfQA: QAI[], quizID, listeners) {
    this.quizQuestions = arrayOfQA.map((qa, i) => ({
      index: `${quizID}.${i}`,
      question: qa.question,
      correctAnswers: qa.correctAnswers,
      submittedAnswers: [],
      correctAnswerCount: 0
    }))
    this.quizID = quizID
    this.listeners = listeners
  }

  getQuestions = () => this.quizQuestions

  submitAnswer = (submittedAnswer: never, i) => {
    this.listeners.onSubmitAnswer()

    this.quizQuestions = this.quizQuestions.map(quizQuestion => {
      if (quizQuestion.index == i) {
        if (quizQuestion.correctAnswers.includes(submittedAnswer)) {
          this.listeners.onSubmitCorrectAnswer(quizQuestion.index)

          return {
            ...quizQuestion,
            correctAnswerCount: quizQuestion.correctAnswerCount + 1
          }
        } else {
          this.listeners.onSubmitIncorrectAnswer(quizQuestion.index)
          return {
            ...quizQuestion,
            submittedAnswers: [
              ...quizQuestion.submittedAnswers,
              submittedAnswer
            ]
          }
        }
      }
      return quizQuestion
    })
  }
}
