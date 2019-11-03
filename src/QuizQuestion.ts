export interface QuizQuestionListeners {
  onSubmitAnswer: () => void
  onSubmitCorrectAnswer: () => void
  onSubmitIncorrectAnswer: () => void
}

export default class QuizQuestion {
  private submittedAnswers: string[] = []
  private correctAnswerCount: number = 0
  listeners: QuizQuestionListeners

  constructor(
    private ID: string,
    private question: any[],
    private correctAnswers: string[] = [],
    listeners: QuizQuestionListeners
  ) {
    this.ID = ID
    this.question = question
    this.correctAnswers = correctAnswers
    this.listeners = listeners
  }

  getInArray() {
    return this.question
  }

  getLastSubmittedAnswer() {
    return this.submittedAnswers[this.submittedAnswers.length - 1]
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
