export default class ScoreService {
  private score: number = 0
  private incrementBy: number = 1
  private strikeLength: number = 0
  private strikeThreshhold: number

  constructor(config?) {
    this.strikeThreshhold = config.strikeThreshhold
  }

  increment = () => {
    if (this.score === 0) this.score = 1

    this.score = this.score + this.incrementBy

    if (this.strikeLength % this.strikeThreshhold === 0) {
      ++this.incrementBy
    }
    ++this.strikeLength

    this.onIncrement()
  }

  resetStrike = () => {
    this.incrementBy = 1
    this.strikeLength = 0
  }

  onIncrement = () => {
    window.dispatchEvent(
      new CustomEvent("score change", {
        detail: { score: this.score, strikeLength: this.strikeLength }
      })
    )
  }
}
