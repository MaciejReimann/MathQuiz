export interface XYRangeI {
  xMin?: number
  xMax: number
  yMin?: number
  yMax: number
}

export class Range<Element> {
  private range: Element[]

  constructor(range: XYRangeI, Element: new (i: number, j: number) => Element) {
    this.range = buildFlatArrayOfIndexedElements(range, Element)
  }

  get = () => this.range
}

const buildFlatArrayOfIndexedElements = <T>(
  range: XYRangeI,
  Element: new (i: number, j: number) => T
): T[] =>
  [...new Array(range.xMax)]
    .slice(range.xMin, range.xMax)
    .map((_, i) => (range.xMin ? i + range.xMin : i))
    .map(i =>
      [...new Array(range.yMax)]
        .slice(range.yMin, range.yMax)
        .map((_, j) => (range.yMin ? j + range.yMin : j))
        .map(j => new Element(i + 1, j + 1))
    )

    .flat()
