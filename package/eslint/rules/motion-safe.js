import {findUngated} from './motion/classes.js'
import {checkStyleBlocks} from './motion/css.js'

const CLASS_ATTRIBUTE = /^(?:class|className|class:list)$|-class$|Class$/

const attributeName = node => {
  const name = node.name
  if (!name) return null
  if (name.type === 'JSXNamespacedName') return `${ name.namespace.name }:${ name.name.name }`
  return name.name ?? null
}

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require motion to be opted into with motion-safe: (classes) or a prefers-reduced-motion query (<style> blocks)',
      recommended: true,
    },
    schema: [
      {
        type: 'object',
        properties: {
          allow: {
            type: 'array',
            items: {type: 'string'},
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      ungated: '`{{token}}` runs under reduced motion. Prefix it with `motion-safe:`, or add a `motion-reduce:` fallback in the same class string.',
      ungatedDuration: '`{{token}}` has no transition property beside it, so under reduced motion it transitions every property. Prefix it with `motion-safe:` like the transition it belongs to.',
      ungatedCss: '`{{token}}` runs under reduced motion. Put it inside `@media (prefers-reduced-motion: no-preference)` or `@variant motion-safe`; in `@apply`, prefix the class with `motion-safe:`.',
    },
  },

  create(context) {
    const allow = context.options[0]?.allow ?? []

    const check = (node, value) => {
      if (typeof value !== 'string' || !value) return

      for (const {token, duration} of findUngated(value, allow)) {
        context.report({node, messageId: duration ? 'ungatedDuration' : 'ungated', data: {token}})
      }
    }

    const isModuleSource = node => {
      const parent = node.parent
      return parent && (
        parent.type === 'ImportDeclaration'
        || parent.type === 'ExportNamedDeclaration'
        || parent.type === 'ExportAllDeclaration'
        || parent.type === 'ImportExpression'
      )
    }

    const scriptVisitor = {
      Literal(node) {
        if (isModuleSource(node)) return
        if (node.parent?.type === 'JSXAttribute' && !CLASS_ATTRIBUTE.test(attributeName(node.parent) ?? '')) return
        check(node, node.value)
      },
      TemplateElement(node) {
        check(node, node.value.cooked)
      },
    }

    const templateVisitor = {
      'VAttribute[directive=false]'(node) {
        if (!CLASS_ATTRIBUTE.test(node.key.name)) return
        check(node, node.value?.value)
      },
      Literal: scriptVisitor.Literal,
      TemplateElement: scriptVisitor.TemplateElement,
    }

    if (/\.(?:vue|astro)$/.test(context.filename)) {
      scriptVisitor['Program:exit'] = () => {
        checkStyleBlocks(context.sourceCode.text, {ruleId: context.id, allow}, (loc, token) => {
          context.report({loc, messageId: 'ungatedCss', data: {token}})
        })
      }
    }

    const parserServices = context.sourceCode.parserServices

    if (parserServices?.defineTemplateBodyVisitor) {
      return parserServices.defineTemplateBodyVisitor(templateVisitor, scriptVisitor)
    }

    return scriptVisitor
  },
}
