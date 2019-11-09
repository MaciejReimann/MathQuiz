import shuffle from "lodash/shuffle"
import QuizQuestion from "./QuizQuestion"

export default class Quiz {
  private id: string
  private quizQuestions: QuizQuestion[]
  options?: any

  constructor(id, quizQuestions, options?) {
    if (options.shuffled) {
      this.quizQuestions = shuffle(quizQuestions)
    } else {
      this.quizQuestions = quizQuestions
    }
    this.id = id
  }

  getID() {
    return this.id
  }

  getAnsweredQuestions() {
    return this.quizQuestions.filter(
      q => q.getLastSubmittedAnswer() != undefined
    )
  }

  getQuestion = nr => this.quizQuestions[nr]
}
