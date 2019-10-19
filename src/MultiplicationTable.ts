export default class MultiplicationTable {
  private equations: MultiplicationEquation[][] = null

  constructor(range: number) {
    this.equations = [...new Array(range)].map((_, i) =>
      [...new Array(range)].map(
        (_, j) => new MultiplicationEquation(i + 1, j + 1)
      )
    )
  }

  getResults = () => {
    return this.equations.flat().map(eq => eq.getResult())
  }
}

class MultiplicationEquation {
  private value1: number = null
  private value2: number = null

  constructor(value1, value2) {
    this.value1 = value1
    this.value2 = value2
  }

  getResult = () => this.value1 * this.value2
}
