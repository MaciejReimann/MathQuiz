export interface QuizQuestionI {
  index: string
  question: any[]
  correctAnswers: any[]
  submittedAnswers: any[]
  correctAnswerCount: number
}

export default class Quiz {
  constructor(
    private quizQuestions: QuizQuestionI[],
    private currentIndex: number = 0
  ) {
    this.quizQuestions = quizQuestions
  }

  incrementIndex() {
    this.currentIndex = this.currentIndex + 1
  }

  getCurrentQuestion() {
    return this.quizQuestions[this.currentIndex]
  }
}
