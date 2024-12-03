export interface LinkProps {
  to: import('vue-router').RouterLinkProps['to']
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface DefaultError extends Error {}

export interface DefaultQueryConfig {
  ApiError: DefaultError
}