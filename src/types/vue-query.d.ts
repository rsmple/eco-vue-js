import '@tanstack/query-core'

declare module '@tanstack/query-core' {
  interface SetDataOptions {
    index?: number
    newItem?: unknown
  }
}
