import {markRaw} from 'vue'

import IconCactus from 'eco-vue-js/dist/assets/icons/IconCactus'
import IconCloud from 'eco-vue-js/dist/assets/icons/IconCloud'
import IconCloudSun from 'eco-vue-js/dist/assets/icons/IconCloudSun'
import IconCloudSunPartial from 'eco-vue-js/dist/assets/icons/IconCloudSunPartial'
import IconFern from 'eco-vue-js/dist/assets/icons/IconFern'
import IconMonstera from 'eco-vue-js/dist/assets/icons/IconMonstera'
import IconSprig from 'eco-vue-js/dist/assets/icons/IconSprig'
import IconSun from 'eco-vue-js/dist/assets/icons/IconSun'

import {Kind, Light} from './Plant'

type Display = {label: string, tone: string, icon: SVGComponent}

// How the fields and the expansion show a kind and a light level. Kept out of the model, which only holds data the API returns.
export const kindDisplay: Record<Kind, Display> = {
  [Kind.TROPICAL]: {label: 'Tropical', tone: 'tone-data-green', icon: markRaw(IconMonstera)},
  [Kind.SUCCULENT]: {label: 'Succulent', tone: 'tone-data-amber', icon: markRaw(IconCactus)},
  [Kind.FERN]: {label: 'Fern', tone: 'tone-data-teal', icon: markRaw(IconFern)},
  [Kind.HERB]: {label: 'Herb', tone: 'tone-data-violet', icon: markRaw(IconSprig)},
}

export const lightDisplay: Record<Light, Display> = {
  [Light.FULL_SUN]: {label: 'Full sun', tone: 'tone-data-amber', icon: markRaw(IconSun)},
  [Light.BRIGHT]: {label: 'Bright', tone: 'tone-data-orange', icon: markRaw(IconCloudSun)},
  [Light.PARTIAL]: {label: 'Partial', tone: 'tone-data-cyan', icon: markRaw(IconCloudSunPartial)},
  [Light.SHADE]: {label: 'Shade', tone: 'tone-data-gray', icon: markRaw(IconCloud)},
}

/** Tone of a health score. */
export const healthTone = (health: number) => health >= 75 ? 'tone-positive' : health >= 50 ? 'tone-warning' : 'tone-negative'
