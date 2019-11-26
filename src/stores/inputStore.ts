import { writable } from "svelte/store"
import { controllerStore } from "./controllerStore"

function createInputStore() {
  const { subscribe, set, update } = writable("")

  let value = ""

  subscribe(val => {
    value = val
  })

  const onInput = inputValue => set(inputValue.replace(/[^0-9]/g, ""))
  const getValue = () => value
  const resetValue = () => {
    controllerStore.turnMicrophoneOn()
    return set("")
  }

  return {
    subscribe,
    onInput,
    getValue,
    resetValue
  }
}

export const inputStore = createInputStore()
