
declare type VueComponent = ReturnType<typeof defineComponent>
declare type SVGComponent = FunctionalComponent<SVGAttributes, Record<string, never>>

declare type PaginatedResponse<ValueType extends Record<string, unknown> = unknown> = {
  count: number
  pages_count: number
  next: number | null
  previous: number | null
  current: number
  results: ValueType[]
}

declare type ValidateFn = (value: string | number | undefined | string[]) => string | undefined

declare module '@whitespots/ui-kit/dist/assets/icons/*' {
  import type {FunctionalComponent, SVGAttributes} from 'vue'
  const src: FunctionalComponent<SVGAttributes>
  export default src
}
