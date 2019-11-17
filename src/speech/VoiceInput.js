export class VoiceInput {
  constructor() {
    this.lang = "pl-PL"
    this.numericOnly = true // TODO: make it constructor parameters

    try {
      this.recognition = new SpeechRecognition()
    } catch {
      this.recognition = new webkitSpeechRecognition()
    }
    this.recognition.lang = this.lang
    this.recognition.interimResults = false
  }

  startAfter(ms) {
    this.id = setTimeout(() => {
      this.recognition.start(), ms
    })
  }

  onResult(cb) {
    this.recognition.onresult = e => {
      const baseResult = e.results[0][0].transcript
      if (this.numericOnly) {
        const result = this.processNumericInput(baseResult).toString()
        cb(result)
      }
    }
  }

  processNumericInput(input) {
    const inputAsSeparateWords = input.split(" ")

    const digits = inputAsSeparateWords
      .map(w => convertStringToDigit(w, this.lang))
      .filter(d => d != undefined)

    const numbers = inputAsSeparateWords.filter(w => !isNaN(parseInt(w)))

    const givenValidAnswers = [...digits, ...numbers]

    const finalResult = givenValidAnswers[givenValidAnswers.length - 1]
    return finalResult || ""
  }

  stop() {
    console.log("stopping")
    clearTimeout(this.id)
    this.recognition.abort()
  }
}

const convertStringToDigit = (string, locale) => {
  return localesStrings[locale][string]
}

const localesStrings = {
  "pl-PL": {
    jeden: "1",
    dwa: "2",
    trzy: "3",
    cztery: "4",
    pięć: "5",
    sześć: "6",
    siedem: "7",
    osioem: "8",
    dziewięć: "9"
  }
}
