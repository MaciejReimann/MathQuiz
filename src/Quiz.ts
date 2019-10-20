import isFunction from "lodash"
export interface AnsweredQuestionI {
  index: string
  question: []
  answers: []
  submittedAnswers: any[]
  correctAnswerCount: number
}

export default class Quiz {
  private answeredQuestions: AnsweredQuestionI[] = null
  private quizID: string = null
  private handlers: {
    onSubmitCorrectAnswer: (id: string) => void
    onSubmitIncorrectAnswer: (id: string) => void
  }

  constructor(answeredQuestions: AnsweredQuestionI[], quizID, handlers) {
    this.answeredQuestions = answeredQuestions.map((qa, i) => ({
      index: `${quizID}.${i}`,
      ...qa,
      submittedAnswers: []
    }))
    this.quizID = quizID
    this.handlers = handlers
  }
  getQuestions = () => this.answeredQuestions

  submitAnswer = (submittedAnswer: never, i) => {
    this.answeredQuestions = this.answeredQuestions.map(quizQuestion => {
      if (quizQuestion.index == i) {
        if (quizQuestion.answers.includes(submittedAnswer)) {
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
