import { writable } from "svelte/store"

function createInputStore() {
  const { subscribe, set, update } = writable("")

  let currentValue = ""

  subscribe(val => {
    currentValue = val
    console.log("InputStore subscribe currentValue", currentValue)
  })

  const onKeyboardInput = inputValue => set(inputValue.replace(/[^0-9]/g, ""))
  const getInputValue = () => currentValue
  const resetValue = () => set("")

  //   {
  //     if (src === "voice") {
  //       const includeAnyNumbers = inputData.match(/\d+/g) !== null
  //       if (includeAnyNumbers) {
  //         displayedInputValue = inputData.match(/\d+/g).map(Number)[0]
  //       }
  //     } else if (isNaN(parseInt(inputData))) {
  //       displayedInputValue = displayedInputValue.slice(
  //         0,
  //         displayedInputValue.length - 1
  //       )
  //     }
  //   }

  return {
    // subscribe,
    onKeyboardInput,
    getInputValue,
    resetValue
  }
}

export const inputStore = createInputStore()
