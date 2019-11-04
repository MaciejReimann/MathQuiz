import shuffle from "lodash/shuffle"
import QuizQuestion from "./QuizQuestion"

import { optionalCallExpression } from "@babel/types"
export default class Quiz {
  constructor(
    private quizQuestions: QuizQuestion[],
    private currentIndex: number = 0,
    options?: any
  ) {
    if (options.shuffled) {
      this.quizQuestions = shuffle(quizQuestions)
    } else {
      this.quizQuestions = quizQuestions
    }
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
