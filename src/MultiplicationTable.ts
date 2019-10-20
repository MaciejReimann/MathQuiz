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

  formatForQuiz = () =>
    this.equations.map(eq => ({
      question: eq.formatRHEq(),
      answers: [eq.getResult().toString()]
    }))
}

class MultiplicationEquation {
  private value1: number = null
  private value2: number = null
  private result: number = null

  constructor(value1, value2) {
    this.value1 = value1
    this.value2 = value2
    this.result = value1 * value2
  }
  formatRHEq = () => [this.value1, "x", this.value2, "=", this.result]
  getResult = () => this.value1 * this.value2
}
