export interface QuizQuestionListeners {
  onSubmitAnswer: () => void
  onSubmitCorrectAnswer: () => void
  onSubmitIncorrectAnswer: () => void
}

export default class QuizQuestion {
  private index: number
  private question: any[]
  private correctAnswers: string[] = []
  private submittedAnswers: string[] = []
  private correctAnswerCount: number = 0
  private listeners: QuizQuestionListeners

  constructor(
    question: any[],
    correctAnswers: any[],
    listeners: QuizQuestionListeners
  ) {
    this.question = question
    this.correctAnswers = correctAnswers
    this.listeners = listeners
  }

  getInArray() {
    return this.question
  }

  submitAnswer(submittedAnswer: string) {
    console.log("QuizQuestion", submittedAnswer)
    if (this.correctAnswers.includes(submittedAnswer)) {
      this.correctAnswerCount = this.correctAnswerCount + 1
      this.listeners.onSubmitCorrectAnswer()
    } else {
      this.listeners.onSubmitIncorrectAnswer()
    }
    this.submittedAnswers = [...this.submittedAnswers, submittedAnswer]
    this.listeners.onSubmitAnswer()
  }
}
