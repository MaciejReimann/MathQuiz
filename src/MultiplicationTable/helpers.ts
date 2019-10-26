export function parseIndex(string) {
  return parseInt(string.match(/\d+/g)[0])
}

export function getXCoord(index) {
  return index % 10
}

export function getYCoord(index) {
  return Math.floor(index / 10)
}

export function checkIfRowFieldShouldBeHighlighted(
  questionIndex,
  focusedField
) {
  return (
    getYCoord(parseIndex(questionIndex)) === getYCoord(focusedField) &&
    getXCoord(parseIndex(questionIndex)) <= getXCoord(focusedField)
  )
}
