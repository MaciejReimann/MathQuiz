import QuizQuestionI from "./Quiz"
import MultiplicationEquation from "./MultiplicationEquation"
export default class MultiplicationTable {
  private equations: MultiplicationEquation[] = null

  constructor(range: number) {
    this.equations = [...new Array(range)]
      .map((_, i) =>
        [...new Array(range)].map(
          (_, j) => new MultiplicationEquation(i + 1, j + 1)
        )
      )
      .flat()
  }

  getResults = () => this.equations.map(eq => eq.getResult())

  getQAPair = () =>
    this.equations.map(eq => ({
      question: eq.formatRHEq(),
      correctAnswers: [eq.getResult().toString()]
    }))
}
