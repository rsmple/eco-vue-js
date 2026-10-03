import type {QueryParamsPlants} from '../api/Plant'
import type {Plant} from '../models/Plant'

import type {ListFields} from 'eco-vue-js/dist/components/List/types'
import {getDefaultFieldConfigMap} from 'eco-vue-js/dist/utils/utils'

import * as FieldPlantCaretaker from './WFieldPlantCaretaker.vue'
import * as FieldPlantGrowth from './WFieldPlantGrowth.vue'
import * as FieldPlantHealth from './WFieldPlantHealth.vue'
import * as FieldPlantHeight from './WFieldPlantHeight.vue'
import * as FieldPlantHumidity from './WFieldPlantHumidity.vue'
import * as FieldPlantKind from './WFieldPlantKind.vue'
import * as FieldPlantLight from './WFieldPlantLight.vue'
import * as FieldPlantName from './WFieldPlantName.vue'
import * as FieldPlantSeeds from './WFieldPlantSeeds.vue'
import * as FieldPlantSpecies from './WFieldPlantSpecies.vue'
import * as FieldPlantStatus from './WFieldPlantStatus.vue'
import * as FieldPlantWater from './WFieldPlantWater.vue'
import * as FieldPlantWaterBy from './WFieldPlantWaterBy.vue'

export const listFieldsPlant = [
  FieldPlantName,
  FieldPlantSpecies,
  FieldPlantKind,
  FieldPlantLight,
  FieldPlantHeight,
  FieldPlantGrowth,
  FieldPlantHealth,
  FieldPlantWater,
  FieldPlantHumidity,
  FieldPlantSeeds,
  FieldPlantCaretaker,
  FieldPlantStatus,
  FieldPlantWaterBy,
] as const satisfies ListFields<Plant, QueryParamsPlants>

// Columns shown until the user changes them in the header settings. `species`, `height`, `water` and `seeds` start hidden.
export const defaultFieldConfigMapPlant = getDefaultFieldConfigMap(listFieldsPlant, [
  'name',
  'kind',
  'light',
  'growth',
  'health',
  'humidity',
  'caretaker',
  'watered',
  'due',
])
