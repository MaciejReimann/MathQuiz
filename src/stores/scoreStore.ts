import { writable } from "svelte/store"

function createStrikeStore() {
  const { subscribe, set, update } = writable(0)

  return {
    subscribe,
    update,
    reset: () => set(0)
  }
}

function createScoreStore(config?) {
  const { subscribe, set, update } = writable(0)
  const strikeStore = createStrikeStore()
  const strikeThreshhold = 5 // config
  let incrementBy = 0 // config

  return {
    subscribe,
    subscribeToStrike: strikeStore.subscribe,
    increment: () =>
      update(n => {
        if (n % strikeThreshhold === 0) ++incrementBy
        strikeStore.update(n => n + 1)
        return n + incrementBy
      }),
    resetStrike: () => strikeStore.reset()
  }
}

export const scoreStore = createScoreStore()
