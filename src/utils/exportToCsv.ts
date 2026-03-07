const escapeNeed = ['"', ',', '\n']
const forbiddenStart = ['=', '+', '-', '@', '\t', '\r']

export const escapeCsvValue = (value: string): string => {
  let str = value

  if (forbiddenStart.includes(str[0]!)) str = ' ' + str

  return escapeNeed.some(item => str.includes(item)) ? '"' + str.replace('"', '""') + '"' : str
}

export const buildCsvContent = (rows: string[][], header?: string[]): string => {
  const result: string[] = []

  if (header) result.push(header.map(escapeCsvValue).join(','))

  for (const row of rows) {
    result.push(row.map(escapeCsvValue).join(','))
  }

  return result.join('\n')
}
