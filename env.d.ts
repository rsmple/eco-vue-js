/// <reference types="vite/client" />

declare module '*.svg?component' {
  import type {FunctionalComponent, SVGAttributes} from 'vue'

  const component: FunctionalComponent<SVGAttributes>
  export default component
}

declare module '*.vue' {
  import type {DefineComponent} from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const component: DefineComponent<object, object, any>
  export default component
}
