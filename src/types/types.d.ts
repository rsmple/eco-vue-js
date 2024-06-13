export interface LinkProps {
  to: import('vue-router').RouterLinkProps['to']
}

interface DefaultError extends Error {}

export interface DefaultQueryConfig {
  ApiError: DefaultError,
}