import {checkCss} from '../rules/motion/css.js'

const RULE_ID = 'custom-rules/motion-safe'
const MESSAGE = 'runs under reduced motion. Put it inside `@media (prefers-reduced-motion: no-preference)` or `@variant motion-safe`; in `@apply`, prefix the class with `motion-safe:`.'

/**
 * Checks `.css` files for motion outside a reduced-motion query. It hands ESLint no code blocks, so no
 * other rule runs on CSS: rules a consumer configures without `files` would otherwise crash on it.
 */
export default ({severity = 1, allow = []} = {}) => {
  const pending = new Map()

  return {
    meta: {name: 'motion-css'},

    preprocess(text, filename) {
      const messages = []

      checkCss(text, {ruleId: RULE_ID, allow}, ({start, end}, token) => {
        messages.push({
          ruleId: RULE_ID,
          severity,
          message: `\`${ token }\` ${ MESSAGE }`,
          line: start.line,
          column: start.column + 1,
          endLine: end.line,
          endColumn: end.column + 1,
        })
      })

      pending.set(filename, messages)

      return []
    },

    postprocess(_, filename) {
      const messages = pending.get(filename) ?? []
      pending.delete(filename)
      return messages
    },
  }
}
