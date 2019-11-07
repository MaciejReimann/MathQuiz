import { writable } from "svelte/store"

function createAppStore(IDs) {
  const { subscribe, set, update } = writable(IDs[0])

  return {
    subscribe,
    next: () => update(n => IDs[IDs.indexOf(n) + 1]),
    previous: () => update(n => IDs[IDs.indexOf(n) - 1]),
    goTo: n => set(n),
    getAllIDs: () => IDs
  }
}
const quizzesIDs = ["x*y=_", "_*y=z", "x*_=z", "table"]

export const appStore = createAppStore(quizzesIDs)
