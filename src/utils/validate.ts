export const validateRequired = (value: unknown) => value === undefined
  || value === null
  || value === ''
  || (Array.isArray(value) && value.length === 0) ? 'A value is required' : undefined

export const validateForbiddenRegexp = (regexp: RegExp, value: string) => {
  const match = value.match(regexp)

  if (match?.length) {
    const message = 'The following symbols are not allowed: ' + match
      .filter((item, index) => match.indexOf(item) === index)
      .map(item => {
        switch (item) {
          case ' ':
            return 'whitespace'
          case '\n':
            return 'line break'
          default:
            return `" ${ item } "`
        }
      })
      .join(', ')

    return message
  }
}

export const validateRequiredSymbols = (required: string, value: string) => {
  const match = required.split('')
    .filter(item => !value.includes(item))
    .map(item => {
      switch (item) {
        case ' ':
          return 'whitespace'
        case '\n':
          return 'line break'
        case '\t':
          return 'tabulation'
        default:
          return `${ item }`
      }
    })
    .join(', ')

  if (match.length) return 'Please include the required symbols: ' + match
}