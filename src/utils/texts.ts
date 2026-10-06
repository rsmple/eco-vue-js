import {shallowReactive} from 'vue'

/** Texts the components show on their own, such as the buttons of a stepper. Each one is a string, or a getter — read as it renders, so a translation follows the locale. */
export type Texts = {
  /** Stepper button to the previous step. */
  back: string
  /** Stepper button to the next step. */
  next: string
  /** Stepper submit button on the last step, unless `submitText` is set. */
  submit: string
  /** Button that closes a form without changes, such as on a stepper's first step. */
  close: string
  /** Button that closes a form and drops its changes, such as on a stepper's first step. Also a confirm's cancel button. */
  cancel: string
  /** A confirm's accept button. */
  accept: string
  /** Asked before a modal with unsaved changes closes with its close button. */
  closeModalTitle: string
  closeModalDescription: string
  /** Button that closes the modal anyway. */
  closeModalAccept: string
  /** Warning when a step, or a form being submitted, has invalid fields. */
  invalidData: string
}

type TextSource = string | (() => string)

const texts = shallowReactive<Record<keyof Texts, TextSource>>({
  back: 'Back',
  next: 'Next',
  submit: 'Submit',
  close: 'Close',
  cancel: 'Cancel',
  accept: 'Accept',
  closeModalTitle: 'Close without saving?',
  closeModalDescription: 'Closing the modal will undo any changes',
  closeModalAccept: 'Close',
  invalidData: 'Form contains invalid data',
})

/**
 * Replaces the texts the components show on their own, app-wide — such as to translate them. Called once, before the app mounts.
 * A getter, such as `() => i18n.global.t('modal.back')`, is read as the text renders, so it follows a change of locale.
 */
export const setTexts = (value: {[Key in keyof Texts]?: TextSource}): void => {
  Object.assign(texts, value)
}

/** The text for `key`, as set with `setTexts`. Read in render or in a computed, so it updates. */
export const getText = (key: keyof Texts): string => {
  const value = texts[key]

  return typeof value === 'function' ? value() : value
}
