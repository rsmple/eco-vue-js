import type {QueryParamsPlants} from '../api/Plant'

import type {FilterComponent} from 'eco-vue-js/dist/components/List/types'

import * as FilterPlantCaretaker from './WFilterPlantCaretaker.vue'
import * as FilterPlantKind from './WFilterPlantKind.vue'
import * as FilterPlantLight from './WFilterPlantLight.vue'
import * as FilterPlantWatered from './WFilterPlantWatered.vue'

// In the order they are offered by the add-filter button.
export const listFilterPlant = [
  FilterPlantKind,
  FilterPlantLight,
  FilterPlantWatered,
  FilterPlantCaretaker,
] satisfies FilterComponent<QueryParamsPlants>[]

// Always shown as chips, first; the rest are behind the add-filter button.
export const listFilterPlantPinned = [
  FilterPlantKind,
] satisfies FilterComponent<QueryParamsPlants>[]
