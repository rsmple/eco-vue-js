import {shallowReactive} from 'vue'

/** Texts the components show on their own, such as the buttons of a stepper. Each one is a string, or a getter — read as it renders, so a translation follows the locale. */
export type Texts = {
  /** Button back to the previous step of a stepper, or to the previous page from a page error. */
  back: string
  /** Stepper button to the next step. */
  next: string
  /** Stepper submit button on the last step, unless `submitText` is set. */
  submit: string
  /** Button that closes a form without changes, such as on a stepper's first step. Also the close button of an export modal and of a dismissable. */
  close: string
  /** Button that closes a form and drops its changes, such as on a stepper's first step. Also a confirm's cancel button. */
  cancel: string
  /** A confirm's accept button. */
  accept: string
  /** Save button of an async input. */
  save: string
  /** Asked before a modal with unsaved changes closes with its close button. */
  closeModalTitle: string
  closeModalDescription: string
  /** Button that closes the modal anyway. */
  closeModalAccept: string
  /** Warning when a step, or a form being submitted, has invalid fields. */
  invalidData: string
  /** A chart line with no points in range, unless its `emptyStub` is set. */
  noData: string
  /** Titles of the start and end of a date picker range. */
  dateFrom: string
  dateTo: string
  /** A date picker value that is not picked. */
  noDate: string
  /** A field wrapper whose value is `null`. */
  notAvailable: string
  /** A list page or a card in a `WQueryBoundary` that failed to load, when the server sends no short `detail`. */
  loadError: string
  /** Shown once for the whole page by `WQueryStatus` when some queries on screen failed while the server answers. */
  partialLoadError: string
  /** A list page, a card in a `WQueryBoundary`, a page error or `WQueryStatus` when the server could not be reached. */
  serverUnavailable: string
  /** Button that loads a failed list page, card, page or every failed query on screen again. */
  retry: string
  /** Heading of a page error. */
  errorTitle: string
  /** A page error for a missing page, or any failure without a `detail` from the server. */
  pageNotFound: string
  /** A page error for a 5xx answer without a `detail`. */
  serverError: string
  /** Title of an error notification, such as a failed request or a failed toggle. */
  error: string
  /** An empty list page or select, unless its `emptyStub` is set. */
  nothingToShow: string
  /** A select or a list search that found nothing. */
  noMatch: string
  /** An async select waiting for a search. */
  startTyping: string
  /** A select or an export still loading. */
  loading: string
  /** Prefix of the option that creates a new value in a select. */
  newOption: string
  /** An input with options and no option to suggest, unless its `emptyStub` is set. */
  noSuggestion: string
  /** Prefix of the option that applies the typed value in an input with options. */
  applyPrefix: string
  /** Button that opens the suggestions of a suggest input. */
  showSuggest: string
  /** Input actions. */
  clear: string
  copy: string
  paste: string
  readFromFile: string
  show: string
  hide: string
  /** Clipboard notifications. */
  copied: string
  nothingToCopy: string
  copyFailed: string
  pasted: string
  nothingToPaste: string
  pasteFailed: string
  pasteTooLong: string
  pasteTooLongDescription: string
  /** Asks to allow clipboard access, followed by the site's host. */
  clipboardDenied: string
  /** Markdown toolbar buttons. */
  bold: string
  italic: string
  strikethrough: string
  inlineCode: string
  codeBlock: string
  insertLink: string
  bulletList: string
  numberedList: string
  increaseIndent: string
  decreaseIndent: string
  quote: string
  insertTable: string
  collapseTable: string
  /** Heading menu of the markdown toolbar; each level is followed by its number. */
  heading: string
  /** List filters. */
  filters: string
  toggleFilters: string
  toggleFilter: string
  addFilter: string
  removeFilter: string
  clearFilter: string
  resetFilters: string
  resetFiltersTitle: string
  resetFiltersDescription: string
  reset: string
  search: string
  searchPlaceholder: string
  /** List header menus. */
  tableSettings: string
  resetColumnSettings: string
  reorderField: string
  hideField: string
  pinColumn: string
  resizeColumn: string
  sort: string
  clearSorting: string
  export: string
  exportCsv: string
  exportJson: string
  exportMarkdown: string
  copyAsMarkdown: string
  /** List rows and the selection bar. */
  selectRow: string
  openRow: string
  expandRow: string
  tableMode: string
  gridMode: string
  selectRange: string
  refetch: string
  view: string
  more: string
  moreOptions: string
  /** Precedes the count of selected rows. */
  selected: string
  noSelectedItems: string
  clearSelection: string
  /** File picker and import/export modals. */
  dropFiles: string
  /** Between the drop area and the browse button of a file picker. */
  or: string
  browseFile: string
  removeFile: string
  downloadReady: string
  download: string
  fileDownloaded: string
  done: string
  abortUpload: string
  /** Close buttons and their labels. */
  closeModal: string
  closeTab: string
  closeNotification: string
  closeImageViewer: string
  viewImage: string
  clickToClose: string
  /** Header bar labels. */
  breadcrumb: string
  openSearch: string
  /** Notification center, unless its own text props are set. */
  notifications: string
  noNotifications: string
  actionRequired: string
  dismissAll: string
  activity: string
  /** A progress bar without a value. */
  inProgress: string
  /** Running header of a printed page, followed by its number. */
  page: string
}

/**
 * Texts that depend on a count, such as `3 more`. Each one is a function of the count, so a translation can pick its plural form.
 * - `moreCount`: filters that don't fit the toolbar.
 * - `pagesCount`: pages of an export.
 * - `importingItems`: title of an import modal, unless its `title` is set.
 * - `showAll`: expands a grouped notification.
 */
export type CountTextKey = 'moreCount' | 'pagesCount' | 'importingItems' | 'showAll'

type TextSource = string | (() => string)

type CountTextSource = (count: number) => string

const plural = (count: number, one: string, many: string) => `${ count } ${ count === 1 ? one : many }`

const texts = shallowReactive<Record<keyof Texts, TextSource>>({
  back: 'Back',
  next: 'Next',
  submit: 'Submit',
  close: 'Close',
  cancel: 'Cancel',
  accept: 'Accept',
  save: 'Save',
  closeModalTitle: 'Close without saving?',
  closeModalDescription: 'Closing the modal will undo any changes',
  closeModalAccept: 'Close',
  invalidData: 'Form contains invalid data',
  noData: 'No data',
  dateFrom: 'From:',
  dateTo: 'To:',
  noDate: 'None',
  notAvailable: 'N / A',
  loadError: 'Failed to load',
  partialLoadError: 'Some data failed to load',
  serverUnavailable: 'Server is unavailable',
  retry: 'Retry',
  errorTitle: 'Oops!',
  pageNotFound: 'This page does not exist or was removed',
  serverError: 'Something went wrong on the server. Try again in a moment',
  error: 'Error',
  nothingToShow: 'Nothing to show',
  noMatch: 'No match',
  startTyping: 'Start typing..',
  loading: 'Loading..',
  newOption: 'New:',
  noSuggestion: 'No suggestion',
  applyPrefix: 'Apply:',
  showSuggest: 'Show suggest',
  clear: 'Clear',
  copy: 'Copy',
  paste: 'Paste',
  readFromFile: 'Read from file',
  show: 'Show',
  hide: 'Hide',
  copied: 'Copied',
  nothingToCopy: 'Nothing to copy',
  copyFailed: 'Copy failed',
  pasted: 'Pasted',
  nothingToPaste: 'Nothing to paste',
  pasteFailed: 'Paste failed',
  pasteTooLong: 'Unable to paste',
  pasteTooLongDescription: 'The length of the pasted value exceeds the allowed limit',
  clipboardDenied: 'Please allow the clipboard actions in browser settings for current domain',
  bold: 'Bold',
  italic: 'Italic',
  strikethrough: 'Strikethrough',
  inlineCode: 'Inline code',
  codeBlock: 'Code block',
  insertLink: 'Insert link',
  bulletList: 'Bullet list',
  numberedList: 'Numbered list',
  increaseIndent: 'Increase indent',
  decreaseIndent: 'Decrease indent',
  quote: 'Quote',
  insertTable: 'Insert table / Align table',
  collapseTable: 'Collapse table',
  heading: 'Heading',
  filters: 'Filters',
  toggleFilters: 'Toggle filters',
  toggleFilter: 'Toggle filter',
  addFilter: 'Add filter',
  removeFilter: 'Remove filter',
  clearFilter: 'Clear filter',
  resetFilters: 'Reset Filters',
  resetFiltersTitle: 'Are you sure?',
  resetFiltersDescription: 'Do you want to reset filters?',
  reset: 'Reset',
  search: 'Search',
  searchPlaceholder: 'Search..',
  tableSettings: 'Table settings',
  resetColumnSettings: 'Reset column settings',
  reorderField: 'Reorder field',
  hideField: 'Hide field',
  pinColumn: 'Pin column',
  resizeColumn: 'Resize column',
  sort: 'Sort',
  clearSorting: 'Clear sorting',
  export: 'Export',
  exportCsv: 'Export as CSV',
  exportJson: 'Export as JSON',
  exportMarkdown: 'Export as Markdown',
  copyAsMarkdown: 'Copy as Markdown',
  selectRow: 'Select row',
  openRow: 'Open row',
  expandRow: 'Expand row',
  tableMode: 'Table mode',
  gridMode: 'Grid mode',
  selectRange: 'Select range',
  refetch: 'Refetch',
  view: 'View',
  more: 'More',
  moreOptions: 'More options',
  selected: 'Selected',
  noSelectedItems: 'No selected items',
  clearSelection: 'Clear selection',
  dropFiles: 'Drag and drop files here',
  or: 'or',
  browseFile: 'Browse file',
  removeFile: 'Remove file',
  downloadReady: 'Download is ready',
  download: 'Download',
  fileDownloaded: 'File downloaded successfully',
  done: 'Done',
  abortUpload: 'Abort upload',
  closeModal: 'Close modal',
  closeTab: 'Close tab',
  closeNotification: 'Close notification',
  closeImageViewer: 'Close image viewer',
  viewImage: 'View image',
  clickToClose: 'Click to close',
  breadcrumb: 'Breadcrumb',
  openSearch: 'Open search',
  notifications: 'Notifications',
  noNotifications: 'No notifications yet',
  actionRequired: 'Action required',
  dismissAll: 'Dismiss all',
  activity: 'Activity',
  inProgress: 'In progress',
  page: 'Page',
})

const countTexts = shallowReactive<Record<CountTextKey, CountTextSource>>({
  moreCount: count => `${ count } more`,
  pagesCount: count => plural(count, 'page', 'pages'),
  importingItems: count => `Importing ${ plural(count, 'item', 'items') }`,
  showAll: count => `Show all ${ count }`,
})

const isCountTextKey = (key: string): key is CountTextKey => key in countTexts

/**
 * Replaces the texts the components show on their own, app-wide — such as to translate them. Called once, before the app mounts.
 * A getter, such as `() => i18n.global.t('modal.back')`, is read as the text renders, so it follows a change of locale.
 * A count text is a function of the count, such as `count => i18n.global.t('list.more', {count}, count)`.
 */
export const setTexts = (value: {[Key in keyof Texts]?: TextSource} & {[Key in CountTextKey]?: CountTextSource}): void => {
  for (const [key, source] of Object.entries(value)) {
    if (isCountTextKey(key)) countTexts[key] = source as CountTextSource
    else texts[key as keyof Texts] = source as TextSource
  }
}

/** The text for `key`, as set with `setTexts`. Read in render or in a computed, so it updates. */
export const getText = (key: keyof Texts): string => {
  const value = texts[key]

  return typeof value === 'function' ? value() : value
}

/** The count text for `key` and `count`, as set with `setTexts`. Read in render or in a computed, so it updates. */
export const getCountText = (key: CountTextKey, count: number): string => countTexts[key](count)
