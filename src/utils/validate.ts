export const validateRequired = (value: unknown) => value === undefined
  || value === null
  || value === ''
  || (Array.isArray(value) && value.length === 0) ? 'A value is required' : undefined