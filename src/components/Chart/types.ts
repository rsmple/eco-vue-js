export interface ChartContext {
  /** Scaling functions */
  scaleX: (value: number) => number
  scaleY: (value: number) => number
  /** Chart dimensions */
  svgWidth: number
  svgHeight: number
  top: number
  bottom: number
  left: number
  right: number
  xExtent: [number, number]
  /** Domain update handler */
  onUpdateDomain: (lineId: string, yExtent: [number, number]) => void
}