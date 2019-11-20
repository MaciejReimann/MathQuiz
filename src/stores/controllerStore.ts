import { writable } from "svelte/store"

interface ControllerStore {
  turnMicrophoneOn: () => void
  turnMicrophoneOff: () => void
  onKeyboardInput: (input: string) => void
  getInputValue: () => string
}

function createControllerStore(): ControllerStore {
  const { subscribe, set, update } = writable("keyboard")
  let inputValue = ""

  const turnMicrophoneOn = () => {
    set("microphone")
    console.log("microphone check 1, 2")
  }

  const turnMicrophoneOff = () => {
    set("keyboard")
    console.log("microphone... offfff")
  }

  const onKeyboardInput = input => {
    inputValue += input
    console.log("onKeyboardInput", inputValue)
  }

  const getInputValue = () => inputValue

  return {
    turnMicrophoneOn,
    turnMicrophoneOff,
    onKeyboardInput,
    getInputValue
  }
}

export const controllerStore: ControllerStore = createControllerStore()
