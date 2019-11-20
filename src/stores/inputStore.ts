import { writable } from "svelte/store"

// interface ControllerStore {
//     subscribe
//   onKeyboardInput: () => void
//   getInputValue: () => string
// }

function createInputStore() {
  const { subscribe, set, update } = writable("")

  let currentValue = ""

  subscribe(val => {
    currentValue = val
    console.log("subscribe", val)
  })

  const onKeyboardInput = inputValue =>
    update(v => {
      if (isNaN(parseInt(inputValue))) {
        return ""
      } else {
        return inputValue + v
      }
    })

  const subscribeTo = val =>
    subscribe(value => {
      value = val + value
      console.log(value)
    })

  const getInputValue = () => currentValue

  //   inputValue.subscribe(inputData => {
  //     if (isNaN(parseInt(inputData))) return ""
  //     else return inputData
  //   })

  //   const bindValue = value => {
  //     retinputValue.subscribe(val => {
  //       value = val
  //     })
  //   }

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
    subscribeTo,
    subscribe,
    onKeyboardInput,
    getInputValue
  }
}

export const inputStore = createInputStore()
