import shuffle from "lodash/shuffle"
import QuizQuestion from "./QuizQuestion"

export default class Quiz {
  private name: string
  private quizQuestions: QuizQuestion[]
  options?: any

  constructor(name, quizQuestions, options?) {
    if (options.shuffled) {
      this.quizQuestions = shuffle(quizQuestions)
    } else {
      this.quizQuestions = quizQuestions
    }
    this.name = name
  }

  getName = () => this.name

  getQuestion = nr => this.quizQuestions[nr]

  getAnsweredQuestions = () =>
    this.quizQuestions.filter(q => q.getLastSubmittedAnswer() != undefined)

  getAllQuestions = () => this.quizQuestions
}
