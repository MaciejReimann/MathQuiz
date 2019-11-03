import QuizQuestion from "./QuizQuestion"

// export interface QuizQuestionI {
//   index: string
//   question: any[]
//   correctAnswers: any[]
//   submittedAnswers: any[]
//   correctAnswerCount: number
// }

export default class Quiz {
  constructor(
    private quizQuestions: QuizQuestion[],
    private currentIndex: number = 0
  ) {
    this.quizQuestions = quizQuestions
  }

  getAnsweredQuestions() {
    return this.quizQuestions.filter(
      q => q.getLastSubmittedAnswer() != undefined
    )
  }

  incrementIndex() {
    this.currentIndex = this.currentIndex + 1
  }

  getCurrentQuestion() {
    return this.quizQuestions[this.currentIndex]
  }

  onSubmitAnswer() {
    this.getCurrentQuestion().listeners.onSubmitAnswer()
  }
}
