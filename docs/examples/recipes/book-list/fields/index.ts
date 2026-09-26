import type {Book, QueryParamsBooks} from '../models/Book'

import type {ListFields} from 'eco-vue-js/dist/components/List/types'
import {getDefaultFieldConfigMap} from 'eco-vue-js/dist/utils/utils'

import * as FieldBookAuthor from './WFieldBookAuthor.vue'
import * as FieldBookGenre from './WFieldBookGenre.vue'
import * as FieldBookStatus from './WFieldBookStatus.vue'
import * as FieldBookTitle from './WFieldBookTitle.vue'
import * as FieldBookYear from './WFieldBookYear.vue'

export const listFieldsBook = [
  FieldBookTitle,
  FieldBookAuthor,
  FieldBookGenre,
  FieldBookYear,
  FieldBookStatus,
] as const satisfies ListFields<Book, QueryParamsBooks>

// Columns shown until the user changes them in the header settings. `genre` starts hidden.
export const defaultFieldConfigMapBook = getDefaultFieldConfigMap(listFieldsBook, [
  'title',
  'author',
  'year',
  'available',
])
