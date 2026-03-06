const regExp = /("|,|\n)/g

const forbiddenStart = ['=', '+', '-', '@', '\t', '\r']

export const escapeCsvValue = (value: string | null | Date | number): string => {
  let str = value === null ? '' : value instanceof Date ? value.toLocaleString() ?? '' : value.toString() ?? ''

  if (forbiddenStart.includes(str[0]!)) str = ' ' + str

  return str.search(regExp) >= 0 ? '"' + str.replace(/"/g, '""') + '"' : str
}

export const buildCsvContent = (rows: (string | number | Date)[][], header?: string[]): string => {
  const result: string[] = []

  if (header) result.push(header.map(escapeCsvValue).join(','))

  for (const row of rows) {
    result.push(row.map(escapeCsvValue).join(','))
  }

  return result.join('\n')
}
