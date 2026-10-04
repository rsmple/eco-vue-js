import type {DropdownProps} from '@/components/Dropdown/types'
import type {LinkProps} from '@/types/types'
import type {SemanticType} from '@/utils/SemanticType'
import type {Component, VNode} from 'vue'

export interface ConfirmModalProps {
  title: string | VNode | Component
  description: string | VNode | Component

  acceptText?: string | VNode | Component
  acceptSemanticType?: SemanticType

  intermediateText?: string | VNode | Component
  intermediateSemanticType?: SemanticType

  cancelText?: string | VNode | Component

  onAccept?: () => void | Promise<void>
  onIntermediate?: () => void | Promise<void>
  onCancel?: () => void

  acceptTo?: LinkProps['to']
  intermediateTo?: LinkProps['to']

  actionsCol?: boolean
  wrapperClass?: string
  maximized?: boolean

  /** Element the confirm sticks to, opening as a dropdown — a bottom sheet on phones — instead of a modal, so the page stays in view. Falls back to the modal when the element is no longer on the page. Opened with `useOverlay` from a menu, the confirm sticks to the menu's anchor instead. */
  anchor?: DropdownProps['parentElement']
}

export type ModalExportProps<Model, QueryParams> = {
  /** Format of the file: the items as JSON, rows of CSV, or Markdown sections. */
  format: 'json' | 'csv' | 'md'
  /** Start of the file name, before the date. */
  fileName?: string
  /** Title of the modal, or a function of the number of items. Defaults to one that names the format. */
  title?: string | ((count: number) => string)
  /** Text of the close button. Defaults to "Close". */
  cancelText?: string
  /** Text of the download button. Defaults to "Download". */
  downloadText?: string
  /** Query the items are loaded with, page by page when it is paginated. */
  useQueryFn?: UseQueryDefault<PaginatedResponse<Model>, QueryParams> | UseQueryDefault<Model[], QueryParams>
  /** Params of the query or `apiMethod`, such as the list's filters. */
  initQueryParams: QueryParams
  /** Loads all the items in one request, instead of `useQueryFn`. */
  apiMethod?: (queryParams: QueryParams) => Promise<Model[]>
  /** Header row of the CSV. */
  header?: string[]
  /** Rows of the CSV for an item. Needed for `csv`. */
  prepare?: (item: Model, index: number) => string[][] | Promise<string[][]>
  /** Markdown of an item. Needed for `md`. */
  toMarkdown?: (item: Model, index: number) => string
  /** Called once the file is downloaded. */
  resolve?: () => void
}
