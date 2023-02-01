
declare type SVGComponent = FunctionalComponent<SVGAttributes, Record<string, never>>

declare module '@whitespots/ui-kit/dist/assets/icons/*' {
  import type {FunctionalComponent, SVGAttributes} from 'vue'
  const src: FunctionalComponent<SVGAttributes>
  export default src
}
