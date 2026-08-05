export const colorValues = (colors: Record<string, unknown>): Record<string, string> => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {__CSS_VALUES__: _ignored, ...values} = colors

  return values as Record<string, string>
}
