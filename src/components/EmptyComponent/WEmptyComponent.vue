<script lang="ts">
import type {DefineComponent, FunctionalComponent} from 'vue'

type Slots = {
  /** Content rendered without a wrapping element. It gets no slot props. */
  default?: (props: {[key: string]: never}) => void
}

// Functional: as an optional wrapper's "off" branch it is rendered for every row of a list, and needs no component
// instance. Typed as the component it was, so `<component :is>` unions with it keep their slot and prop types.
const WEmptyComponent: FunctionalComponent = (_props, {slots}) => slots.default?.()

WEmptyComponent.inheritAttrs = false

export default WEmptyComponent as unknown as DefineComponent & (new () => {$slots: Slots})
</script>
