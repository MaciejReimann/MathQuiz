export class VoiceInput {
  constructor() {
    //lang
    try {
      this.recognition = new SpeechRecognition()
    } catch {
      this.recognition = new webkitSpeechRecognition()
    }
    // let SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
    // const SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList
    // const SpeechRecognitionEvent =
    //   SpeechRecognitionEvent || webkitSpeechRecognitionEvent

    this.recognition.lang = "pl-PL"
    this.recognition.interimResults = false
  }

  startAfter(ms) {
    const id = setTimeout(() => {
      this.recognition.start(), ms
    })
  }

  onResult(cb) {
    this.recognition.onresult = e => cb(e.results[0][0].transcript)
  }

  stop() {
    this.recognition.stop()
  }
}
