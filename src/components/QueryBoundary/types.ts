import type {Ref} from 'vue'

export type BoundaryQuery = {
  data: Readonly<Ref<unknown>>
  error: Readonly<Ref<Error | null>>
  refetch: () => Promise<unknown>
}
