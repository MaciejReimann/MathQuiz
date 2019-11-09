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
    const answeredQuestions = this.quizQuestions.filter(
      q => q.getLastSubmittedAnswer() != undefined
    )
    console.log("getAnsweredQuestions", answeredQuestions)
    return answeredQuestions
  }

  getQuestion = nr => this.quizQuestions[nr]
}
