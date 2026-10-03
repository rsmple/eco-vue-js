import {markRaw} from 'vue'

import IconCelery from 'eco-vue-js/dist/assets/icons/IconCelery'
import IconCloud from 'eco-vue-js/dist/assets/icons/IconCloud'
import IconCloudSun from 'eco-vue-js/dist/assets/icons/IconCloudSun'
import IconCloudSunPartial from 'eco-vue-js/dist/assets/icons/IconCloudSunPartial'
import IconLayer from 'eco-vue-js/dist/assets/icons/IconLayer'
import IconPlant from 'eco-vue-js/dist/assets/icons/IconPlant'
import IconSun from 'eco-vue-js/dist/assets/icons/IconSun'

import {Kind, Light} from './Plant'

type Display = {label: string, tone: string, icon: SVGComponent}

// How the fields and the expansion show a kind and a light level. Kept out of the model, which only holds data the API returns.
export const kindDisplay: Record<Kind, Display> = {
  [Kind.TROPICAL]: {label: 'Tropical', tone: 'tone-data-green', icon: markRaw(IconPlant)},
  [Kind.SUCCULENT]: {label: 'Succulent', tone: 'tone-data-amber', icon: markRaw(IconSun)},
  [Kind.FERN]: {label: 'Fern', tone: 'tone-data-teal', icon: markRaw(IconLayer)},
  [Kind.HERB]: {label: 'Herb', tone: 'tone-data-violet', icon: markRaw(IconCelery)},
}

export const lightDisplay: Record<Light, Display> = {
  [Light.FULL_SUN]: {label: 'Full sun', tone: 'tone-data-amber', icon: markRaw(IconSun)},
  [Light.BRIGHT]: {label: 'Bright', tone: 'tone-data-orange', icon: markRaw(IconCloudSun)},
  [Light.PARTIAL]: {label: 'Partial', tone: 'tone-data-cyan', icon: markRaw(IconCloudSunPartial)},
  [Light.SHADE]: {label: 'Shade', tone: 'tone-data-gray', icon: markRaw(IconCloud)},
}

/** Tone of a health score. */
export const healthTone = (health: number) => health >= 75 ? 'tone-positive' : health >= 50 ? 'tone-warning' : 'tone-negative'
