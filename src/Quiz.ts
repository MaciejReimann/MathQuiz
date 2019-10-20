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
  private handlers: {
    onSubmitCorrectAnswer: (id: string) => void
    onSubmitIncorrectAnswer: (id: string) => void
  }

  constructor(arrayOfQA: QAI[], quizID, handlers) {
    this.quizQuestions = arrayOfQA.map((qa, i) => ({
      index: `${quizID}.${i}`,
      question: qa.question,
      correctAnswers: qa.correctAnswers,
      submittedAnswers: [],
      correctAnswerCount: 0
    }))
    console.log(this.quizQuestions)
    this.quizID = quizID
    this.handlers = handlers
  }
  getQuestions = () => this.quizQuestions

  submitAnswer = (submittedAnswer: never, i) => {
    this.quizQuestions = this.quizQuestions.map(quizQuestion => {
      if (quizQuestion.index == i) {
        if (quizQuestion.correctAnswers.includes(submittedAnswer)) {
          this.handlers.onSubmitCorrectAnswer(quizQuestion.index)

          return {
            ...quizQuestion,
            correctAnswerCount: quizQuestion.correctAnswerCount + 1
          }
        } else {
          this.handlers.onSubmitIncorrectAnswer(quizQuestion.index)
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
