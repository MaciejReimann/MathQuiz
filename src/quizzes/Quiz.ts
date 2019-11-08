import shuffle from "lodash/shuffle"
import QuizQuestion from "./QuizQuestion"

export default class Quiz {
  private id: string
  private quizQuestions: QuizQuestion[]
  private currentIndex: number
  options?: any

  constructor(id, quizQuestions, startIndex?, options?) {
    if (options.shuffled) {
      this.quizQuestions = shuffle(quizQuestions)
    } else {
      this.quizQuestions = quizQuestions
    }
    this.id = id
    this.currentIndex = startIndex || 0
  }

  getID() {
    return this.id
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
