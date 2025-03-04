const newValues = {
  '8xl': '88rem',
  '9xl': '96rem',
  '10xl': '104rem',

  '--header-height': 'var(--header-height)',
  '--header-padding-bottom': 'var(--header-padding-bottom)',
  '--nav-bar-width': 'var(--nav-bar-width)',
  '--actions-bar-width': 'var(--actions-bar-width)',
  '--actions-bar-inner-width': 'var(--actions-bar-inner-width)',
  '--inner-margin': 'var(--inner-margin)',
  '--inner-width-diff': 'var(--inner-width-diff)',
  '--w-modal-wrapper-padding': 'var(--w-modal-wrapper-padding)',
  '--w-option-padding': 'var(--w-option-padding)',
  '--w-input-height': 'var(--w-input-height)',
  '--w-input-gap': 'var(--w-input-gap)',
  '--w-select-option-padding': 'var(--w-select-option-padding)',
}

const extend = {
  1.25: '0.3125rem',
  6: '1.5rem',
  8.5: '2.125rem',
  10: '2.5rem',
  11: '2.75rem',
  15: '3.75rem',
  18: '4.5rem',
  28: '7rem',
  30: '7.5rem',
  34: '8.5rem',
  36: '9rem',
  112: '28rem',

  ...newValues,
}

export default {
  height: extend,
  width: extend,
  maxWidth: extend,
  minWidth: extend,
  padding: extend,
  margin: extend,
  inset: extend,
  gap: extend,
}
