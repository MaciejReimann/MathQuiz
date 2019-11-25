export interface QuizQuestionListeners {
  onSubmitAnswer: (quizQuestion: QuizQuestion) => void
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
  private correctAnswersCount: number = 0
  listeners: QuizQuestionListeners

  constructor(
    private parentQuizName: string,
    private question: (string | number)[],
    private correctAnswers: string[] = [],
    listeners: QuizQuestionListeners
  ) {
    this.parentQuizName = parentQuizName
    this.question = question
    this.correctAnswers = correctAnswers
    this.listeners = listeners
  }

  getParentQuizName = () => this.parentQuizName

  getAsArray = (): (string | number)[] => this.question

  getAsString = (): string => JSON.stringify(this.question)

  getSubmittedAnswersAsString = (): string =>
    JSON.stringify(this.submittedAnswers)

  getCorrectAnswersAsString = (): string => JSON.stringify(this.correctAnswers)

  getCorrectAnswersCount = (): number => this.correctAnswersCount

  getLastSubmittedAnswer(): string {
    return this.submittedAnswers[this.submittedAnswers.length - 1]
  }

  getCorrectAnswer = (): string => this.correctAnswers[0]

  submitAnswer = (submittedAnswer: string): QuizQuestion => {
    if (this.correctAnswers.includes(submittedAnswer)) {
      this.correctAnswersCount = this.correctAnswersCount + 1
      this.listeners.onSubmitCorrectAnswer(this.parentQuizName)
    } else {
      this.listeners.onSubmitIncorrectAnswer(this.parentQuizName)
    }
    this.submittedAnswers.push(submittedAnswer)
    this.listeners.onSubmitAnswer(this)

    return this
  }
}
