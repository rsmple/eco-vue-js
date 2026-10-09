import type {VNode} from 'vue'

export interface TabsProps {
  /** Tab items rendered instead of the `default` slot. */
  customSlots?: VNode[]
  /** Fades between tabs instead of sliding. */
  lessTransitions?: boolean
  /** Name of the tab opened first. */
  initTab?: string
  /** Index of the tab opened first, when `initTab` is not set. */
  initTabIndex?: number
  /** Puts the tab buttons in a column beside the content. On small screens the buttons and the content become two swipeable screens, and picking a tab scrolls to its content. */
  side?: boolean
  /** Lets the content shrink to the current tab's height. By default it keeps the height of the tallest tab shown so far. */
  disableMinHeight?: boolean
  /** Hides the tab buttons. Switch tabs through the exposed methods. */
  noHeader?: boolean
  /** Classes for the row of tab buttons. */
  headerClass?: string
  /** Switches to a tab when it is added. */
  switchToNew?: boolean
  /** Numbers the tab titles and disables every tab after the first one with `hasValue` false. The exposed `next` and `jump` check the Uniform fields of the tab they leave and stay on it if one is invalid. Enables `update:progress`, `update:first` and `update:last`. */
  stepper?: boolean
  /**
   * With `stepper`, brings its own controls: the open step's title, a progress line, and Back, Next and submit buttons — Close on the first step in an overlay.
   * In a frame, such as a modal or a page WModalWrapper, they go to its title, subtitle and actions, under a title of the form's own if there is one; the first stepper in the frame takes it.
   * The submit checks the last step and submits the enclosing form with `api-method`, or emits `submit`.
   */
  stepperControls?: boolean
  /** Text of the submit button on the last step with `stepperControls`. Defaults to the `submit` text of `setTexts`. */
  submitText?: string
  /** With `stepperControls`, shows a spinner in the Next or submit button and disables Back and Close, such as while a submit on `submit` runs. A form with `api-method` around the stepper does it on its own. */
  submitting?: boolean
  /** With `stepperControls`, disables the Next or submit button, such as until something is picked on the step. */
  disabledNext?: boolean
  /** Colors the titles of tabs that have a value. */
  showHasValue?: boolean
  /** Stays on the current tab when another one gets an error. By default the first tab with an error is opened. */
  noSwitchOnInvalid?: boolean
  /** Wraps the tab buttons onto new lines instead of scrolling sideways. */
  wrap?: boolean
  /** Draws a line under the row of tab buttons, which the open tab's underline covers. */
  divider?: boolean
  /** Shows a value and error status icon next to each title. */
  statusIcon?: boolean
  /** Renders all tabs one after another, each under its title, without the buttons. */
  flat?: boolean
  /** Shows a large status circle on each tab button — error, has value or empty. */
  indicator?: boolean
}

export type TabsItemProps = {
  /** Title of the tab button. The `title` slot replaces it. */
  title?: string
  /** Unique key of the tab, used by `initTab`, `update:current` and the exposed methods. */
  name: string
  /** Icon before the title. */
  icon?: SVGComponent
  /** Disables the tab button. */
  disabled?: boolean
  /** Unmounts the content while the tab is not open, instead of hiding it. */
  removable?: boolean
  /** Opens this tab first, when WTabs has no `initTab` or `initTabIndex`. */
  init?: boolean
  /** Marks the tab as filled in. By default it is read from the forms inside the tab. */
  hasValue?: boolean | null
  /** Marks the tab as invalid. By default it is read from the forms inside the tab. */
  hasError?: boolean
  /** Shows the unsaved changes dot. By default it is read from the forms inside the tab. */
  hasChanges?: boolean
  /** Checks the tab before the exposed `next` and `jump` leave it. A returned error message is shown as a warning and the tab stays open. */
  validate?: () => string | undefined
  /** Submits the enclosing stepper form before moving forward past this tab, and stays on it if the submit fails. */
  requireSave?: boolean
  /** Number shown in a badge after the title, tinted while the tab is open. */
  count?: number
}
