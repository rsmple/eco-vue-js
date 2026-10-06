import {type ComputedRef, computed, provide, shallowReactive} from 'vue'

import {type OverlayFrameOptions, type OverlayPart, type OverlayRegion, wOverlayRegions} from '../models/overlayRegistry'

/**
 * Makes the component a frame with the given areas: the parts its content hands over with OverlayRegionPart, by area, for it to render,
 * and the options the content asks it to look with — `null` until some content asks. A part for an area not in `accepted` renders in place. Called in setup.
 */
export const useOverlayRegions = (accepted: readonly OverlayRegion[]): {
  regions: Readonly<Record<OverlayRegion, readonly OverlayPart[]>>
  options: ComputedRef<OverlayFrameOptions | null>
} => {
  const regions = shallowReactive<Record<OverlayRegion, readonly OverlayPart[]>>({
    title: [],
    subtitle: [],
    header: [],
    actions: [],
  })

  const optionSources = shallowReactive(new Map<symbol, () => OverlayFrameOptions>())

  provide(wOverlayRegions, {
    add: (region, part) => {
      if (!accepted.includes(region)) return false

      regions[region] = [...regions[region], part]

      return true
    },
    remove: (region, part) => {
      regions[region] = regions[region].filter(item => item !== part)
    },
    setOptions: (source, getOptions) => {
      if (getOptions) optionSources.set(source, getOptions)
      else optionSources.delete(source)
    },
  })

  const options = computed(() => {
    const getOptions = [...optionSources.values()].at(-1)

    return getOptions ? getOptions() : null
  })

  return {regions, options}
}
