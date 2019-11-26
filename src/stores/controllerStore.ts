import { writable } from "svelte/store"
import { VoiceInput } from "../speech/VoiceInput"
import { inputStore } from "../stores/inputStore"

interface ControllerStore {
  turnMicrophoneOn: () => void
  turnMicrophoneOff: () => void
  getCurrentController: () => string
}

function createControllerStore(): ControllerStore {
  const { subscribe, set, update } = writable("keyboard")
  const voiceInput = new VoiceInput()

  let currentController = ""

  subscribe(val => {
    currentController = val
  })

  const turnMicrophoneOn = () => {
    set("microphone")
    startVoiceInput()
    console.log("microphone check 1, 2")
  }

  const turnMicrophoneOff = () => {
    set("keyboard")
    console.log("microphone... offfff")
  }

  const getCurrentController = () => currentController

  const startVoiceInput = () => {
    console.log("voice input initialized")
    voiceInput.stop()
    voiceInput.startAfter(50)
    voiceInput.onResult(res => {
      inputStore.onInput(res)
    }, urgeToRepeat)
  }

  const urgeToRepeat = () => {
    console.log("REPEAT PLEASE")
    startVoiceInput()
  }

  return {
    turnMicrophoneOn,
    turnMicrophoneOff,
    getCurrentController
  }
}

export const controllerStore: ControllerStore = createControllerStore()
