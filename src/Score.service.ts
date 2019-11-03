export default class ScoreService {
  private score: number = 0
  private incrementBy: number = 1
  private strikeLength: number = 0
  private strikeThreshhold: number = 5
  private incrementCallbacks = []

  constructor(config?) {
    if (config && config.strikeThreshhold) {
      this.strikeThreshhold = config.strikeThreshhold
    }
  }

  getScore = () => this.score

  getStrikeLength = () => this.strikeLength

  incrementScore = () => {
    if (this.score === 0) this.score = 1

    this.score = this.score + this.incrementBy

    if (this.strikeLength % this.strikeThreshhold === 0) {
      ++this.incrementBy
    }
    ++this.strikeLength

    this.incrementCallbacks.map(cb => cb())
  }

  resetStrike = () => {
    this.incrementBy = 1
    this.strikeLength = 0
  }

  setCallbacksForIncrement = cb => {
    if (typeof cb === "function") this.incrementCallbacks.push(cb)
    else
      throw new Error(
        "Callback provided to Score.service.ts is not a function!"
      )
  }
}
