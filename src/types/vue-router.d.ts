import 'vue-router'

declare module 'vue-router' {
  interface RouterLinkProps {
    // Add the click event type
    onClick?: (event: MouseEvent) => void
  }
}