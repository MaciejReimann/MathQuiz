export class NavigationHandler {
  private lastFieldIndex: number = null
  private firstFieldIndex: number = null
  private currentFieldIndex: number = null
  private fieldsToSkip: number[] = []
  private listener: any

  constructor(config) {
    this.firstFieldIndex = config.firstFieldIndex
    this.lastFieldIndex = config.lastFieldIndex
    this.currentFieldIndex = config.firstFieldIndex
    this.listener = config.listener
  }

  goRight() {
    if (this.currentFieldIndex + 1 === this.lastFieldIndex) {
      this.currentFieldIndex = this.firstFieldIndex - 1
    }
    if ((this.currentFieldIndex + 1) % 10 === 0) {
      this.currentFieldIndex = this.currentFieldIndex + 2
    } else {
      this.currentFieldIndex = this.currentFieldIndex + 1
    }
    if (this.fieldsToSkip.includes(this.currentFieldIndex)) {
      this.goRight()
    }
  }

  goLeft() {
    if (this.currentFieldIndex === this.firstFieldIndex) {
      this.currentFieldIndex = this.lastFieldIndex
    }
    if (this.currentFieldIndex % 10 === 1) {
      this.currentFieldIndex = this.currentFieldIndex - 2
    } else {
      this.currentFieldIndex = this.currentFieldIndex - 1
    }
    if (this.fieldsToSkip.includes(this.currentFieldIndex)) {
      this.goLeft()
    }
  }

  goDown() {
    if (this.currentFieldIndex + 10 > this.lastFieldIndex) {
      this.currentFieldIndex = (this.currentFieldIndex % 10) + 10
    } else {
      this.currentFieldIndex = this.currentFieldIndex + 10
    }
    if (this.fieldsToSkip.includes(this.currentFieldIndex)) {
      this.goDown()
    }
  }

  goUp() {
    if (this.currentFieldIndex - 10 < this.firstFieldIndex) {
      this.currentFieldIndex = this.lastFieldIndex + this.currentFieldIndex - 20
    } else {
      this.currentFieldIndex = this.currentFieldIndex - 10
    }
    if (this.fieldsToSkip.includes(this.currentFieldIndex)) {
      this.goUp()
    }
  }

  handleKey(fieldsToSkip) {
    this.fieldsToSkip = fieldsToSkip
    return key => {
      switch (key) {
        case "ArrowUp":
          this.goUp()
          break
        case "ArrowLeft":
          this.goLeft()
          break
        case "ArrowRight":
          this.goRight()
          break
        case "ArrowDown":
          this.goDown()
          break
      }
      this.listener(this.currentFieldIndex)
    }
  }
}
