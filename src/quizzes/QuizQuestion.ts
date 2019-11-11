export interface QuizQuestionListeners {
  onSubmitAnswer: () => void
  onSubmitCorrectAnswer: (id: string) => void
  onSubmitIncorrectAnswer: (id: string) => void
}

export interface QuizQuestionI {
  getAsArray: () => (string | number)[]
  getLastSubmittedAnswer: () => string
  submitAnswer: (submittedAnswer: string) => void
}

export default class QuizQuestion implements QuizQuestionI {
  private submittedAnswers: string[] = []
  private correctAnswerCount: number = 0
  listeners: QuizQuestionListeners

  constructor(
    private ID: string,
    private question: (string | number)[],
    private correctAnswers: string[] = [],
    listeners: QuizQuestionListeners
  ) {
    this.ID = ID
    this.question = question
    this.correctAnswers = correctAnswers
    this.listeners = listeners
  }

  getAsArray(): (string | number)[] {
    return this.question
  }

  getLastSubmittedAnswer(): string {
    return this.submittedAnswers[this.submittedAnswers.length - 1]
  }

  submitAnswer(submittedAnswer: string): void {
    if (this.correctAnswers.includes(submittedAnswer)) {
      this.correctAnswerCount = this.correctAnswerCount + 1
      this.listeners.onSubmitCorrectAnswer(this.ID)
    } else {
      this.listeners.onSubmitIncorrectAnswer(this.ID)
    }
    this.submittedAnswers.push(submittedAnswer)
    this.listeners.onSubmitAnswer()
  }
}
