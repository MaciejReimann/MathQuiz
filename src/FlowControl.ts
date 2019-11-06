import { setContext } from "svelte"
import { writable } from "svelte/store"

export default class FlowControl {
  private scoreService = null
  private appletsIDs: [string, string, string, string]

  private currentAppletId: string

  constructor(scoreService) {
    this.appletsIDs = ["x * y = _", "_ * y = z", "x * _ = z", "table"]

    this.scoreService = scoreService

    // appStore.subscribe(value => {
    //   currentAppletID = value
    // })
  }

  setAppletId = id => {
    this.currentAppletId = id
    console.log(this.currentAppletId)
  }

  getSelectedAppletId = () => this.currentAppletId

  getAppletIDs = () => this.appletsIDs

  handleAnswerSubmitted = e => {
    if (e.detail.correct) {
      this.scoreService.incrementScore()
    } else {
      this.scoreService.resetStrike()
    }
  }
}
