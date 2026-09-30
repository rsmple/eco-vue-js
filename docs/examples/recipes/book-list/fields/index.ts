import type {QueryParamsBooks} from '../api/Book'
import type {Book} from '../models/Book'

import type {ListFields} from 'eco-vue-js/dist/components/List/types'
import {getDefaultFieldConfigMap} from 'eco-vue-js/dist/utils/utils'

import * as FieldBookAuthor from './WFieldBookAuthor.vue'
import * as FieldBookDue from './WFieldBookDue.vue'
import * as FieldBookGenre from './WFieldBookGenre.vue'
import * as FieldBookLoans from './WFieldBookLoans.vue'
import * as FieldBookPages from './WFieldBookPages.vue'
import * as FieldBookRating from './WFieldBookRating.vue'
import * as FieldBookStatus from './WFieldBookStatus.vue'
import * as FieldBookTitle from './WFieldBookTitle.vue'
import * as FieldBookYear from './WFieldBookYear.vue'

export const listFieldsBook = [
  FieldBookTitle,
  FieldBookAuthor,
  FieldBookGenre,
  FieldBookYear,
  FieldBookPages,
  FieldBookRating,
  FieldBookLoans,
  FieldBookStatus,
  FieldBookDue,
] as const satisfies ListFields<Book, QueryParamsBooks>

// Columns shown until the user changes them in the header settings. `genre`, `pages` and `loans` start hidden.
export const defaultFieldConfigMapBook = getDefaultFieldConfigMap(listFieldsBook, [
  'title',
  'author',
  'year',
  'rating',
  'available',
  'due',
])
