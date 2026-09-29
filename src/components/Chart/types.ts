/** Scales and sizes of a WChartLinear, passed by its default slot to each line. */
export interface ChartContext {
  /** Converts a timestamp to an x position in px. */
  scaleX: (value: number) => number
  /** Converts a value to a y position in px. */
  scaleY: (value: number) => number
  /** Width of the chart in px. */
  svgWidth: number
  /** Height of the chart in px. */
  svgHeight: number
  /** Space above the plot in px. */
  top: number
  /** Space under the plot in px. */
  bottom: number
  /** Space left of the plot in px. */
  left: number
  /** Space right of the plot in px. */
  right: number
  /** Time range of the x axis, as `[from, to]` timestamps in ms. */
  xExtent: [number, number]
  /** Reports the range of a line's values, for the chart to fit the y axis to all its lines. */
  onUpdateDomain: (lineId: string, yExtent: [number, number]) => void
}
